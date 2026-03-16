import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import type { RepublicResponse } from "@/src/features/republic/types/republic.types";
import { legalLinks, openLegalLink } from "@/src/shared/constants/legal";
import { ResidentRole } from "@/src/shared/types/resident.types";
import { MenuItem, UserMenuContext } from "@/src/shared/types/sideMenu";

interface SideMenuOptions {
  republicId?: string;
  republics?: RepublicResponse[];
  currentUserRole?: ResidentRole | null;
  /** Badge em "Meus Convites" — convites recebidos pelo usuário com status PENDENTE */
  pendingInvitesCount?: number;
  /** Badge em "Convites Enviados" — convites enviados pela república com status PENDENTE */
  pendingInvitesSentCount?: number;
  /** Badge em "Pagamentos" — contas da república ainda não pagas */
  pendingPaymentsCount?: number;
}

export function useSideMenu(
  context: UserMenuContext,
  handleSignOut: () => void,
  options: SideMenuOptions = {},
) {
  const {
    republicId,
    republics = [],
    currentUserRole,
    pendingInvitesCount,
    pendingInvitesSentCount,
    pendingPaymentsCount,
  } = options;
  const router = useRouter();

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

  const navigatePayments = useCallback(() => {
    if (!republicId) return;

    router.push({
      pathname: "/(republics)/[id]/payments",
      params: { id: republicId },
    });
  }, [republicId, router]);

  const navigateToRepublic = useCallback(
    (targetRepublicId: string) => {
      if (targetRepublicId === republicId) return;
      router.push(`/(republics)/${targetRepublicId}`);
    },
    [republicId, router],
  );

  const republicMenuItems = useMemo(
    () =>
      republics.map((republic) => ({
        id: `republic-${republic.id}`,
        label: republic.nome,
        image: republic.imagemRepublica,
        onPress: () => navigateToRepublic(republic.id),
        active: republic.id === republicId,
      })),
    [navigateToRepublic, republicId, republics],
  );

  const menuItems = useMemo<MenuItem[]>(() => {
    const base = {
      switchRepublic: {
        id: "switchRepublic",
        label: "Trocar República",
        icon: "swap-horizontal-outline" as const,
        children: republicMenuItems,
        emptyLabel: "Nenhuma república vinculada",
      },
      profile: {
        id: "profile",
        label: "Meu Perfil",
        icon: "person-outline" as const,
        onPress: navigateProfile,
      },
      invites: {
        id: "invites",
        label: "Meus Convites",
        icon: "mail-outline" as const,
        onPress: navigateInvites,
        badge: pendingInvitesCount,
      },
      invitesSent: {
        id: "invitesSent",
        label: "Convites Enviados",
        icon: "mail-outline" as const,
        onPress: navigateInvitesSent,
        badge: pendingInvitesSentCount,
      },

      payments: {
        id: "payment",
        label: "Pagamentos",
        icon: "wallet-outline" as const,
        onPress: navigatePayments,
        badge: pendingPaymentsCount,
      },
    };

    switch (context) {
      case "home":
        if (currentUserRole === ResidentRole.USER) {
          return [base.profile, base.switchRepublic, base.invitesSent];
        }
        return [
          base.profile,
          base.switchRepublic,

          base.invitesSent,
          base.payments,
        ];

      case "profile":
        return [base.invites];

      default:
        return [];
    }
  }, [
    context,
    currentUserRole,
    pendingInvitesCount,
    pendingInvitesSentCount,
    pendingPaymentsCount,
    navigateProfile,
    navigateInvites,
    navigateInvitesSent,
    navigatePayments,
    republicMenuItems,
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
