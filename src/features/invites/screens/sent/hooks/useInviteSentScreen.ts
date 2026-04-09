import { useRouter } from "expo-router";
import { useCallback } from "react";

import { useInvitesByRepublicQuery } from "@/src/features/invites/hooks/useInvitesQueries";
import { getErrorMessage } from "@/src/services/httpError";

export function useInviteSentScreen(republicId: string) {
  const router = useRouter();
  const invitesQuery = useInvitesByRepublicQuery(republicId);

  const handleRetry = useCallback(() => {
    void invitesQuery.refetch();
  }, [invitesQuery]);

  const handleEmptyStatePress = useCallback(() => {
    router.back();
  }, [router]);

  return {
    invites: invitesQuery.data ?? [],
    error: invitesQuery.error
      ? getErrorMessage(
          invitesQuery.error,
          "Não foi possível carregar os convites enviados."
        )
      : null,
    loading: invitesQuery.isLoading || invitesQuery.isFetching,
    handleRetry,
    handleEmptyStatePress,
  };
}
