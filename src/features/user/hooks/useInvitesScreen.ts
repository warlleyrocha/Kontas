import { useCallback, useMemo, useState } from "react";
import { useRouter } from "expo-router";

import { useAuth } from "@/src/features/auth/contexts";
import { useSideMenu } from "@/src/components/SideMenu/useSideMenu";
import { toastErrors } from "@/src/utils/toastMessages";

const mockInvites = [
  {
    id: "1",
    republicaNome: "República dos Amigos",
    republicaImagem:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400",
    convidadoPor: "João Silva",
    dataConvite: "2025-12-18",
    moradores: 4,
  },
  {
    id: "2",
    republicaNome: "Casa do Sol",
    republicaImagem: null,
    convidadoPor: "Maria Santos",
    dataConvite: "2025-12-15",
    moradores: 6,
  },
];

export function useInvitesScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [invites, setInvites] = useState(mockInvites);

  const handleAcceptInvite = useCallback(
    (id: string) => {
      console.log("Aceitar convite:", id);
      setInvites((prev) => prev.filter((invite) => invite.id !== id));
      router.push("/register/residents");
    },
    [router]
  );

  const handleRejectInvite = useCallback((id: string) => {
    console.log("Recusar convite:", id);
    setInvites((prev) => prev.filter((invite) => invite.id !== id));
  }, []);

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
    invites,
    isMenuOpen,
    setIsMenuOpen,
    handleAcceptInvite,
    handleRejectInvite,
    menuItems,
    footerItems,
    sideMenuUser,
  };
}
