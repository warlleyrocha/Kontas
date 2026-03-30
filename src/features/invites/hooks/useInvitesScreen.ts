import { useCallback, useMemo, useState } from "react";
import { useRouter } from "expo-router";

import { useLogoutMutation } from "@/src/features/auth/hooks/useAuthQueries";
import { StatusInvite } from "@/src/features/invites/types/invite.types";
import { getErrorMessage } from "@/src/services/httpError";
import { useCurrentUserQuery } from "@/src/features/user/hooks/useUserQueries";
import { useSideMenu } from "@/src/shared/components/SideMenu/useSideMenu";
import { toastErrors } from "@/src/shared/utils/toastMessages";

import {
  useInvitesByUserQuery,
  useUpdateInviteStatusMutation,
} from "./useInvitesQueries";

export function useInvitesScreen() {
  const router = useRouter();
  const { data: user = null } = useCurrentUserQuery();
  const { mutateAsync: logout } = useLogoutMutation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const {
    data: invitesByUserData,
    error: invitesByUserError,
    refetch: refetchInvitesByUser,
  } = useInvitesByUserQuery();
  const updateStatusMutation = useUpdateInviteStatusMutation();

  const invitesByUser = useMemo(
    () => invitesByUserData ?? [],
    [invitesByUserData]
  );
  const pendingCount = useMemo(
    () =>
      invitesByUser.filter((i) => i.status === StatusInvite.PENDENTE).length,
    [invitesByUser]
  );

  const handleSignOut = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Erro ao fazer logout da conta:", error);
      toastErrors.logoutFailed(error);
    }
  }, [logout]);

  const fetchInvitesByUser = useCallback(async () => {
    await refetchInvitesByUser();
  }, [refetchInvitesByUser]);

  const handleAcceptInvite = useCallback(
    async (inviteId: string, republicaId: string) => {
      try {
        await updateStatusMutation.mutateAsync({
          inviteId,
          status: StatusInvite.ACEITO,
        });
        router.replace(`/(republics)/${republicaId}`);
      } catch (error) {
        console.error("Erro ao aceitar convite:", error);
      }
    },
    [router, updateStatusMutation]
  );

  const handleRejectInvite = useCallback(
    async (inviteId: string) => {
      try {
        await updateStatusMutation.mutateAsync({
          inviteId,
          status: StatusInvite.RECUSADO,
        });
      } catch (error) {
        console.error("Erro ao recusar convite:", error);
      }
    },
    [updateStatusMutation]
  );

  const rawError = invitesByUserError ?? updateStatusMutation.error;

  const { menuItems, footerItems } = useSideMenu("invite", handleSignOut, {
    pendingInvitesCount: pendingCount,
  });

  const sideMenuUser = useMemo(
    () => ({ name: user?.nome ?? "Usuário", photo: user?.fotoPerfil }),
    [user]
  );

  return {
    isMenuOpen,
    setIsMenuOpen,
    invitesByUser,
    fetchInvitesByUser,
    handleAcceptInvite,
    handleRejectInvite,
    error: rawError
      ? getErrorMessage(rawError, "Não foi possível carregar os convites.")
      : null,
    menuItems,
    footerItems,
    sideMenuUser,
  };
}
