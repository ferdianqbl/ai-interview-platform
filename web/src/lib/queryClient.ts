import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes: queries remain fresh and won't trigger unnecessary background refetches
      gcTime: 1000 * 60 * 10,   // 10 minutes: inactive queries remain in memory for instant tab/page switching
      refetchOnWindowFocus: false, // Prevents sudden UI flicker during recruiter interviews
      retry: (failureCount, error: any) => {
        // Do not retry client 4xx errors (e.g. 404 Not Found, 401 Unauthorized, 422 Unprocessable)
        const status = error?.response?.status;
        if (status && status >= 400 && status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
