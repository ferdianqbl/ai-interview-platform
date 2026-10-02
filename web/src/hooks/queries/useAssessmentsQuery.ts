import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { assessmentsApi, type AssessmentPayload } from "@/services/assessments";
import { queryKeys } from "@/lib/queryKeys";
import type { Assessment, Session } from "@/types";

export function useAssessmentsQuery(page: number = 1) {
  return useQuery({
    queryKey: queryKeys.assessments.list(page),
    queryFn: async (): Promise<Assessment[]> => {
      const res = await assessmentsApi.list(page);
      return res.data.assessments || [];
    },
  });
}

export function useAssessmentDetailQuery(id: number | string | undefined) {
  const aId = Number(id);

  return useQuery({
    queryKey: queryKeys.assessments.detail(aId),
    queryFn: async (): Promise<Assessment> => {
      const res = await assessmentsApi.get(aId);
      return res.data.assessment;
    },
    enabled: !isNaN(aId) && aId > 0,
  });
}

export function useCreateAssessmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AssessmentPayload) => {
      const res = await assessmentsApi.create(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.all });
    },
  });
}

export function useUpdateAssessmentMutation(id: number | string | undefined) {
  const queryClient = useQueryClient();
  const aId = Number(id);

  return useMutation({
    mutationFn: async (payload: AssessmentPayload) => {
      const res = await assessmentsApi.update(aId, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.detail(aId) });
    },
  });
}

export function useDeleteAssessmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await assessmentsApi.delete(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.all });
    },
  });
}

export function useCreateSessionMutation(assessmentId: number | string | undefined) {
  const queryClient = useQueryClient();
  const aId = Number(assessmentId);

  return useMutation({
    mutationFn: async (candidateName?: string) => {
      const res = await assessmentsApi.createSession(aId, candidateName);
      return res.data.session as Session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.detail(aId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.list() });
    },
  });
}
