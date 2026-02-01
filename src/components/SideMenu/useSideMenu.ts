import { ResidentRole } from "@/src/types/resident.types";
import { MenuItem, UserMenuContext } from "@/src/types/sideMenu";
import { useRouter } from "expo-router";
import { useMemo } from "react";

export function useSideMenu(
  context: UserMenuContext,
  handleSignOut: () => void,
  republicId?: string, // Adicione este parâmetro
  currentUserRole?: ResidentRole | null
) {
  const router = useRouter();

  const navigation = {
    home: () => router.push("/"),
    profile: () => router.push("/(userProfile)/profile"),
    invites: () => router.push("/(userProfile)/invites"),
    invitesSent: () => {
      if (!republicId) return;
      router.push({
        pathname: "/(republics)/[id]/invites-sent",
        params: { id: republicId },
      });
    },
    controlPanel: () => router.push("/(userProfile)/control-panel"),
  };

  const menuItems = useMemo<MenuItem[]>(() => {
    const base = {
      home: {
        id: "home",
        label: "Início",
        icon: "home-outline" as const,
        onPress: navigation.home,
      },
      profile: {
        id: "profile",
        label: "Meu Perfil",
        icon: "person-outline" as const,
        onPress: navigation.profile,
      },
      invites: {
        id: "invites",
        label: "Convites",
        icon: "mail-outline" as const,
        onPress: navigation.invites,
      },
      invitesSent: {
        id: "invitesSent",
        label: "Convites Enviados",
        icon: "mail-outline" as const,
        onPress: navigation.invitesSent,
      },
      controlPanel: {
        id: "controlPanel",
        label: "Painel de Controle",
        icon: "grid-outline" as const,
        onPress: navigation.controlPanel,
      },
    };

    switch (context) {
      case "home":
        if (currentUserRole === ResidentRole.USER) {
          return [base.home, base.profile, base.invitesSent];
        }
        return [base.home, base.profile, base.invitesSent, base.controlPanel];

      case "profile":
        return [base.home, base.invites];

      case "invite":
        return [base.home, base.profile, base.invites];

      default:
        return [];
    }
  }, [
    context,
    republicId, // Adicione republicId nas dependências
    currentUserRole,
    navigation.home,
    navigation.profile,
    navigation.invites,
    navigation.invitesSent,
    navigation.controlPanel,
  ]);

  const footerItems = useMemo<MenuItem[]>(
    () => [
      {
        id: "logout",
        label: "Sair",
        icon: "log-out-outline" as const,
        onPress: handleSignOut,
        danger: true,
      },
    ],
    [handleSignOut]
  );

  return { menuItems, footerItems };
}
