import { useCallback, useEffect } from "react";
import { useRouter } from "expo-router";

import { useInvitesContext } from "@/src/features/invites/contexts/InvitesContext";

export function useInvitesSentScreen(republicId: string) {
  const router = useRouter();

  const {
    invitesSentByRepublic,
    invitesSentError,
    invitesSentLoading,
    fetchInvitesByRepublic,
  } = useInvitesContext();

  const invites = invitesSentByRepublic[republicId] ?? [];

  useEffect(() => {
    fetchInvitesByRepublic(republicId);
  }, [republicId, fetchInvitesByRepublic]);

  const handleRetry = useCallback(() => {
    fetchInvitesByRepublic(republicId);
  }, [republicId, fetchInvitesByRepublic]);

  const handleEmptyStatePress = useCallback(() => {
    router.back();
  }, [router]);

  return {
    invites,
    error: invitesSentError,
    loading: invitesSentLoading,
    handleRetry,
    handleEmptyStatePress,
  };
}
