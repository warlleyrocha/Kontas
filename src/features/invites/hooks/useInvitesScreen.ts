import { useCallback, useMemo, useState } from "react";

import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { useLogoutMutation } from "@/src/features/auth/hooks/useAuthQueries";
import { useInvitesContext } from "@/src/features/invites/contexts/InvitesContext";
import { useSideMenu } from "@/src/shared/components/SideMenu/useSideMenu";
import { toastErrors } from "@/src/shared/utils/toastMessages";

export function useInvitesScreen() {
  const { user } = useAuth();
  const { mutateAsync: logout } = useLogoutMutation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Erro ao fazer logout da conta:", error);
      toastErrors.logoutFailed(error);
    }
  }, [logout]);

  const {
    invitesByUser,
    pendingCount,
    error,
    fetchInvitesByUser,
    handleAcceptInvite,
    handleRejectInvite,
  } = useInvitesContext();

  const { menuItems, footerItems } = useSideMenu("invite", handleSignOut, {
    pendingInvitesCount: pendingCount,
  });

  const sideMenuUser = useMemo(() => {
    return { name: user?.nome ?? "Usuário", photo: user?.fotoPerfil };
  }, [user]);

  return {
    isMenuOpen,
    setIsMenuOpen,

    invitesByUser,
    fetchInvitesByUser,
    handleAcceptInvite,
    handleRejectInvite,
    error,

    menuItems,
    footerItems,
    sideMenuUser,
  };
}
