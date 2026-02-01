import { useCallback, useMemo, useState } from "react";
import { useRouter } from "expo-router";

import { useAuth } from "@/src/features/auth/contexts";
import { useSideMenu } from "@/src/components/SideMenu/useSideMenu";
import { toastErrors } from "@/src/utils/toastMessages";

export function useInvitesScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = useCallback(async () => {
    try {
      await logout();
      router.replace("/");
    } catch (error) {
      console.error("Erro ao fazer logout da conta:", error);
      toastErrors.logoutFailed();
    }
  }, [logout, router]);

  const { menuItems, footerItems } = useSideMenu("invite", handleSignOut);

  const sideMenuUser = useMemo(() => {
    return { name: user?.nome ?? "Usuário", photo: user?.fotoPerfil };
  }, [user]);

  return {
    isMenuOpen,
    setIsMenuOpen,

    menuItems,
    footerItems,
    sideMenuUser,
  };
}
