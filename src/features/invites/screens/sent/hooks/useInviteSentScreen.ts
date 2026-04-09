import { useRouter } from "expo-router";
import { useCallback } from "react";

import { useInvitesByRepublicQuery } from "@/src/features/invites/hooks/useInvitesQueries";
import { getErrorMessage } from "@/src/services/httpError";
import { StatusInvite } from "@/src/features/invites/types/invite.types";


export function useInviteSentScreen(republicId: string) {
  const router = useRouter();
  const invitesQuery = useInvitesByRepublicQuery(republicId);

  const invites = invitesQuery.data ?? [];
  const pendingCount = invites.filter(
    (i) => i.status === StatusInvite.PENDENTE
  ).length;

  const handleRetry = useCallback(() => {
    void invitesQuery.refetch();
  }, [invitesQuery]);

  const handleEmptyStatePress = useCallback(() => {
    router.back();
  }, [router]);

  return {
    error: invitesQuery.error
      ? getErrorMessage(
          invitesQuery.error,
          "Não foi possível carregar os convites enviados."
        )
      : null,
    loading: invitesQuery.isLoading || invitesQuery.isFetching,
    handleRetry,
    handleEmptyStatePress,
    invites,
    pendingCount,
  };
}
