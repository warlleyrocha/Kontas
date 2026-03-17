import { QueryClient } from "@tanstack/react-query";

import { AppError } from "@/src/services/httpError";

const MAX_QUERY_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 300;
const MAX_RETRY_DELAY_MS = 3000;

function shouldRetryQuery(error: unknown) {
  if (error instanceof AppError) {
    if (error.code === "ERR_CANCELED" || error.code === "CIRCUIT_OPEN") {
      return false;
    }

    if (error.status === undefined) {
      return true;
    }

    return error.status === 408 || error.status === 429 || error.status >= 500;
  }

  if (error instanceof Error) {
    const errorWithCode = error as Error & { code?: string };
    if (
      errorWithCode.code === "ERR_CANCELED" ||
      errorWithCode.code === "CIRCUIT_OPEN"
    ) {
      return false;
    }
  }

  return true;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) =>
        failureCount < MAX_QUERY_RETRIES && shouldRetryQuery(error),
      retryDelay: (attempt) =>
        Math.min(BASE_RETRY_DELAY_MS * 2 ** attempt, MAX_RETRY_DELAY_MS),
    },
    mutations: {
      retry: false,
    },
  },
});
