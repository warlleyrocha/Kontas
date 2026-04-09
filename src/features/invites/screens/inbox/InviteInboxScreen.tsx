import { useRouter } from "expo-router";

import { InviteList } from "@/src/features/invites/components/InviteList";
import { useInviteInboxScreen } from "@/src/features/invites/screens/inbox/hooks/useInviteInboxScreen";
import { ScreenLayout } from "@/src/shared/components/ScreenLayout";
import { useComponentLogger } from "@/src/shared/hooks/useComponentLogger";

export function InviteInboxScreen() {
  useComponentLogger("InvitesInboxScreen");
  const router = useRouter();

  const {
    invitesByUser,
    fetchInvitesByUser,
    handleAcceptInvite,
    handleRejectInvite,
    pendingCount,
    error,
  } = useInviteInboxScreen();

  return (
    <ScreenLayout
      title="Meus Convites"
      subtitle={`${pendingCount} ${pendingCount === 1 ? "pendente" : "pendentes"}`}
    >
      <InviteList
        error={error}
        invites={invitesByUser}
        onRetry={fetchInvitesByUser}
        emptyState={{
          icon: "mail-open-outline",
          iconColor: "#337176",
          bgColor: "bg-teal/10",
          title: "Nenhum convite pendente",
          description:
            "Quando alguém te convidar para uma república, o convite aparecerá aqui.",
          buttonText: "Voltar ao Perfil",
          onPress: () => router.push("/(userProfile)/profile"),
        }}
        variant="received"
        onAcceptInvite={handleAcceptInvite}
        onRejectInvite={handleRejectInvite}
      />
    </ScreenLayout>
  );
}
