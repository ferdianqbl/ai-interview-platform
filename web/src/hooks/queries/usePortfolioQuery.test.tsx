import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePortfolioQuery, useSaveOverrideMutation } from "./usePortfolioQuery";
import { sessionsApi } from "@/services/sessions";
import { portfoliosApi } from "@/services/portfolios";
import { queryKeys } from "@/lib/queryKeys";

vi.mock("@/services/sessions", () => ({
  sessionsApi: {
    getPortfolio: vi.fn(),
  },
}));

vi.mock("@/services/portfolios", () => ({
  portfoliosApi: {
    getOverride: vi.fn(),
    regenerate: vi.fn(),
  },
}));

describe("TanStack Query: usePortfolioQuery & useSaveOverrideMutation", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 60000 },
        mutations: { retry: false },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("fetches and caches portfolio data successfully", async () => {
    const mockPortfolio = {
      id: 1,
      session_id: 10,
      generation_status: "complete",
      skills: [
        {
          id: 101,
          skill_id: "sk-db",
          skill_label: "Database Design",
          ai_level: 2,
          ai_confidence: "high",
          is_discovered: false,
          evidence: ["Design schemas"],
          competency_summary: "Good skills",
        },
      ],
      overrides: [],
    };

    vi.mocked(sessionsApi.getPortfolio).mockResolvedValueOnce({
      data: { portfolio: mockPortfolio, status: "complete" },
    } as any);

    const { result } = renderHook(() => usePortfolioQuery(10), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.portfolio?.id).toBe(1);
    expect(result.current.data?.portfolio?.skills[0].skill_label).toBe(
      "Database Design"
    );
  });

  it("optimistically updates portfolio skill override in cache before server responds", async () => {
    const initialPortfolio = {
      id: 1,
      session_id: 10,
      generation_status: "complete",
      skills: [
        {
          id: 101,
          skill_id: "sk-db",
          skill_label: "Database Design",
          ai_level: 2,
          ai_confidence: "high",
          is_discovered: false,
          evidence: ["Design schemas"],
          competency_summary: "Good skills",
        },
      ],
      overrides: [],
    };

    // Pre-populate query cache
    queryClient.setQueryData(queryKeys.portfolio.bySession(10), {
      portfolio: initialPortfolio,
      status: "complete",
    });

    let resolveServerPromise: (value: any) => void;
    const serverPromise = new Promise((resolve) => {
      resolveServerPromise = resolve;
    });

    vi.mocked(portfoliosApi.getOverride).mockReturnValueOnce(serverPromise as any);

    const { result } = renderHook(() => useSaveOverrideMutation(10), { wrapper });

    // Trigger mutation
    act(() => {
      result.current.mutate({
        skillId: 101,
        overrideLevel: 4,
        notes: "Candidate has strong DB tuning experience.",
      });
    });

    // Verify cache was updated OPTIMISTICALLY right away
    await waitFor(() => {
      const cachedData = queryClient.getQueryData<any>(queryKeys.portfolio.bySession(10));
      expect(cachedData?.portfolio?.skills[0].assessor_override).toBeDefined();
      expect(
        cachedData?.portfolio?.skills[0].assessor_override.override_level
      ).toBe(4);
      expect(
        cachedData?.portfolio?.skills[0].assessor_override.assessor_notes
      ).toBe("Candidate has strong DB tuning experience.");
    });

    // Complete server request
    await act(async () => {
      resolveServerPromise!({
        data: {
          override: {
            id: 50,
            portfolio_skill_id: 101,
            override_level: 4,
            assessor_notes: "Candidate has strong DB tuning experience.",
          },
        },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("rolls back optimistic update when server mutation fails", async () => {
    const initialPortfolio = {
      id: 1,
      session_id: 10,
      generation_status: "complete",
      skills: [
        {
          id: 101,
          skill_id: "sk-db",
          skill_label: "Database Design",
          ai_level: 2,
          ai_confidence: "high",
          is_discovered: false,
          evidence: ["Design schemas"],
          competency_summary: "Good skills",
        },
      ],
      overrides: [],
    };

    queryClient.setQueryData(queryKeys.portfolio.bySession(10), {
      portfolio: initialPortfolio,
      status: "complete",
    });

    vi.mocked(portfoliosApi.getOverride).mockRejectedValueOnce(
      new Error("Network Error")
    );

    const { result } = renderHook(() => useSaveOverrideMutation(10), { wrapper });

    await act(async () => {
      try {
        await result.current.mutateAsync({
          skillId: 101,
          overrideLevel: 5,
          notes: "Failing override",
        });
      } catch {
        // Expected failure
      }
    });

    // Verify cache rolled back
    const rolledBackData = queryClient.getQueryData<any>(
      queryKeys.portfolio.bySession(10)
    );
    expect(
      rolledBackData?.portfolio?.skills[0].assessor_override
    ).toBeUndefined();
  });
});
