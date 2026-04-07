import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCachedUserQuery,
  useCurrentUserQuery,
} from "@/src/features/user/hooks/useUserQueries";
import type { User } from "@/src/features/user/types/user.types";

function useAuthenticatedSessionState() {
  const {
    data: authenticatedUser = null,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useCurrentUserQuery();

  return {
    authenticatedUser,
    isAuthenticated: Boolean(authenticatedUser),
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  };
}

function useSessionLifecycleEffect(
  authenticatedUser: User | null,
  isError: boolean
) {
  const queryClient = useQueryClient();
  const wasAuthenticatedRef = useRef(false);

  useEffect(() => {
    const isAuthenticated = Boolean(authenticatedUser);

    if (wasAuthenticatedRef.current && !isAuthenticated && !isError) {
      queryClient.clear();
    }

    wasAuthenticatedRef.current = isAuthenticated;
  }, [authenticatedUser, isError, queryClient]);
}

export function useAuthSession() {
  const session = useAuthenticatedSessionState();
  const { data: cachedUser = null } = useCachedUserQuery();

  return {
    cachedUser,
    ...session,
  };
}

export function useAuth() {
  return useAuthenticatedSessionState();
}

export function useSessionLifecycle() {
  const { authenticatedUser, isError } = useAuthenticatedSessionState();

  useSessionLifecycleEffect(authenticatedUser, isError);
}

export function useProtectedSession() {
  return useAuthSession();
}
