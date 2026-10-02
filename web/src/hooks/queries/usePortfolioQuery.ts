import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionsApi } from "@/services/sessions";
import { portfoliosApi } from "@/services/portfolios";
import { queryKeys } from "@/lib/queryKeys";
import type { Portfolio, AssessorOverride, PortfolioSkill } from "@/types";

export interface PortfolioApiResponse {
  portfolio?: Portfolio;
  status?: string;
  message?: string;
}

export function usePortfolioQuery(sessionId: number | string | undefined) {
  const sId = Number(sessionId);

  return useQuery({
    queryKey: queryKeys.portfolio.bySession(sId),
    queryFn: async (): Promise<PortfolioApiResponse> => {
      const res = await sessionsApi.getPortfolio(sId);
      return res.data as PortfolioApiResponse;
    },
    enabled: !isNaN(sId) && sId > 0,
    refetchInterval: (query) => {
      const data = query.state.data;
      const status = data?.status || data?.portfolio?.generation_status;
      // Auto-poll every 3s if generating or pending
      if (status === "generating" || status === "pending") {
        return 3000;
      }
      return false;
    },
  });
}

export function useSaveOverrideMutation(sessionId: number | string | undefined) {
  const queryClient = useQueryClient();
  const sId = Number(sessionId);

  return useMutation({
    mutationFn: async ({
      skillId,
      overrideLevel,
      notes,
    }: {
      skillId: number;
      overrideLevel: number;
      notes: string;
    }) => {
      const res = await portfoliosApi.getOverride(skillId, {
        override_level: overrideLevel,
        assessor_notes: notes,
      });
      return res.data.override as AssessorOverride;
    },
    // Optimistic Update: instantly update the UI cache before the server responds
    onMutate: async ({ skillId, overrideLevel, notes }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.portfolio.bySession(sId) });

      const previousData = queryClient.getQueryData<PortfolioApiResponse>(
        queryKeys.portfolio.bySession(sId)
      );

      if (previousData?.portfolio) {
        const existingSkills = previousData.portfolio.skills || [];
        const targetSkill = existingSkills.find((s) => s.id === skillId);
        const baseAiLevel = targetSkill
          ? typeof targetSkill.ai_level === "number"
            ? targetSkill.ai_level
            : Number(targetSkill.ai_level) || 0
          : 0;

        const syntheticOverride: AssessorOverride = {
          id: Date.now(),
          portfolio_skill_id: skillId,
          ai_level: baseAiLevel,
          override_level: overrideLevel,
          assessor_notes: notes,
          overridden_by: undefined,
          overridden_at: new Date().toISOString(),
        };

        const updatedSkills = existingSkills.map(
          (skill: PortfolioSkill) => {
            if (skill.id === skillId) {
              return {
                ...skill,
                assessor_override: syntheticOverride,
              };
            }
            return skill;
          }
        );

        const updatedOverrides = [
          ...(previousData.portfolio.overrides || []).filter(
            (o) => o.portfolio_skill_id !== skillId
          ),
          syntheticOverride,
        ];

        queryClient.setQueryData<PortfolioApiResponse>(queryKeys.portfolio.bySession(sId), {
          ...previousData,
          portfolio: {
            ...previousData.portfolio,
            skills: updatedSkills,
            overrides: updatedOverrides,
          },
        });
      }

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.portfolio.bySession(sId), context.previousData);
      }
    },
    onSettled: () => {
      // Refetch portfolio and invalidate all fitgap reports to guarantee fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolio.bySession(sId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.fitgap.all });
    },
  });
}

export function useRegeneratePortfolioMutation(sessionId: number | string | undefined) {
  const queryClient = useQueryClient();
  const sId = Number(sessionId);

  return useMutation({
    mutationFn: async () => {
      const res = await sessionsApi.regeneratePortfolio(sId);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolio.bySession(sId) });
    },
  });
}
