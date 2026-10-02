import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { portfoliosApi } from "@/services/portfolios";
import { queryKeys } from "@/lib/queryKeys";
import type { FitGapReport } from "@/types";

export interface FitGapApiResponse {
  report?: FitGapReport;
  status?: string;
  message?: string;
}

export function useFitGapQuery(
  portfolioId: number | string | undefined,
  vacancyId: number | string | undefined
) {
  const pId = Number(portfolioId);
  const vId = Number(vacancyId);

  return useQuery({
    queryKey: queryKeys.fitgap.detail(pId, vId),
    queryFn: async (): Promise<FitGapApiResponse> => {
      try {
        const res = await portfoliosApi.getFitGap(pId, vId);
        return { report: res.data.report, status: "complete" };
      } catch (err: any) {
        if (err?.response?.status === 404 || err?.response?.status === 202) {
          // Trigger generation if not found or accepted
          try {
            await portfoliosApi.triggerFitGap(pId, vId);
          } catch {
            // Ignore trigger duplicate errors
          }
          return { status: "generating" };
        }
        throw err;
      }
    },
    enabled: !isNaN(pId) && pId > 0 && !isNaN(vId) && vId > 0,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === "generating" || !data?.report) {
        return 3000;
      }
      return false;
    },
  });
}

export function useRegenerateFitGapMutation(
  portfolioId: number | string | undefined,
  vacancyId: number | string | undefined
) {
  const queryClient = useQueryClient();
  const pId = Number(portfolioId);
  const vId = Number(vacancyId);

  return useMutation({
    mutationFn: async () => {
      const res = await portfoliosApi.regenerateFitGap(pId, vId);
      return res.data;
    },
    onSuccess: (data: any) => {
      if (data?.report) {
        queryClient.setQueryData(queryKeys.fitgap.detail(pId, vId), {
          report: data.report,
          status: "complete",
        });
      } else {
        queryClient.setQueryData(queryKeys.fitgap.detail(pId, vId), {
          status: "generating",
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.fitgap.detail(pId, vId) });
    },
  });
}
