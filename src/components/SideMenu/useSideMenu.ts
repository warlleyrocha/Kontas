import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { legalLinks, openLegalLink } from "@/src/shared/constants/legal";
import { ResidentRole } from "@/src/shared/types/resident.types";
import { MenuItem, UserMenuContext } from "@/src/shared/types/sideMenu";

export function useSideMenu(
  context: UserMenuContext,
  handleSignOut: () => void,
  republicId?: string, // Adicione este parâmetro
  currentUserRole?: ResidentRole | null,
) {
  const router = useRouter();

  const navigateHome = useCallback(() => {
    router.push("/");
  }, [router]);

  const navigateProfile = useCallback(() => {
    router.push("/(userProfile)/profile");
  }, [router]);

  const navigateInvites = useCallback(() => {
    router.push("/(userProfile)/invites");
  }, [router]);

  const navigateInvitesSent = useCallback(() => {
    if (!republicId) return;

    router.push({
      pathname: "/(republics)/[id]/invites-sent",
      params: { id: republicId },
    });
  }, [republicId, router]);

  const navigateControlPanel = useCallback(() => {
    router.push("/(userProfile)/control-panel");
  }, [router]);

  const navigatePayments = useCallback(() => {
    router.push("/payments");
  }, [router]);

  const menuItems = useMemo<MenuItem[]>(() => {
    const base = {
      home: {
        id: "home",
        label: "Início",
        icon: "home-outline" as const,
        onPress: navigateHome,
      },
      profile: {
        id: "profile",
        label: "Meu Perfil",
        icon: "person-outline" as const,
        onPress: navigateProfile,
      },
      invites: {
        id: "invites",
        label: "Convites",
        icon: "mail-outline" as const,
        onPress: navigateInvites,
      },
      invitesSent: {
        id: "invitesSent",
        label: "Convites Enviados",
        icon: "mail-outline" as const,
        onPress: navigateInvitesSent,
      },
      controlPanel: {
        id: "controlPanel",
        label: "Painel de Controle",
        icon: "grid-outline" as const,
        onPress: navigateControlPanel,
      },
      payments: {
        id: "payment",
        label: "Pagamentos",
        icon: "wallet-outline" as const,
        onPress: navigatePayments,
      },
    };

    switch (context) {
      case "home":
        if (currentUserRole === ResidentRole.USER) {
          return [base.home, base.profile, base.invitesSent];
        }
        return [
          base.profile,
          base.invitesSent,
          base.payments,
          base.controlPanel,
        ];

      case "profile":
        return [base.home, base.invites];

      case "invite":
        return [base.home, base.profile, base.invites];

      default:
        return [];
    }
  }, [
    context,
    currentUserRole,
    navigateHome,
    navigateProfile,
    navigateInvites,
    navigateInvitesSent,
    navigateControlPanel,
    navigatePayments,
  ]);

  const footerItems = useMemo<MenuItem[]>(
    () => [
      {
        id: "termsOfUse",
        label: "Termos de Uso",
        icon: "document-text-outline" as const,
        onPress: () =>
          void openLegalLink(legalLinks.termsOfUse, "Termos de Uso"),
      },
      {
        id: "privacyPolicy",
        label: "Política de Privacidade",
        icon: "shield-checkmark-outline" as const,
        onPress: () =>
          void openLegalLink(
            legalLinks.privacyPolicy,
            "Política de Privacidade",
          ),
      },
      {
        id: "logout",
        label: "Sair",
        icon: "log-out-outline" as const,
        onPress: handleSignOut,
        danger: true,
      },
    ],
    [handleSignOut],
  );

  return { menuItems, footerItems };
}
