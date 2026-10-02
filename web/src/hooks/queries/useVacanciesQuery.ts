import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vacanciesApi, type VacancyPayload } from "@/services/vacancies";
import { queryKeys } from "@/lib/queryKeys";
import type { Vacancy } from "@/types";

export function useVacanciesQuery() {
  return useQuery({
    queryKey: queryKeys.vacancies.list(),
    queryFn: async (): Promise<Vacancy[]> => {
      const res = await vacanciesApi.list();
      return res.data.vacancies || [];
    },
  });
}

export function useVacancyDetailQuery(id: number | string | undefined) {
  const vId = Number(id);

  return useQuery({
    queryKey: queryKeys.vacancies.detail(vId),
    queryFn: async (): Promise<Vacancy> => {
      const res = await vacanciesApi.get(vId);
      return res.data.vacancy;
    },
    enabled: !isNaN(vId) && vId > 0,
  });
}

export function useCreateVacancyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: VacancyPayload) => {
      const res = await vacanciesApi.create(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vacancies.all });
    },
  });
}

export function useUpdateVacancyMutation(id: number | string | undefined) {
  const queryClient = useQueryClient();
  const vId = Number(id);

  return useMutation({
    mutationFn: async (payload: VacancyPayload) => {
      const res = await vacanciesApi.update(vId, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vacancies.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.vacancies.detail(vId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.fitgap.all });
    },
  });
}

export function useDeleteVacancyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await vacanciesApi.delete(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vacancies.all });
    },
  });
}
