import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Configure standard TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default retry strategy: retry once before showing error
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes cache stale duration
      throwOnError: false,
    },
  },
});

/**
 * Global Query Client Provider wrapper.
 */
export const QueryProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Devtools helper for debugging query state */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default QueryProvider;
