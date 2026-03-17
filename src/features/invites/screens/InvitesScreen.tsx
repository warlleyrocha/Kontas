import { useRouter } from "expo-router";

import { InvitesInboxContent } from "@/src/features/invites/components/InvitesInboxContent";
import { ScreenLayout } from "@/src/shared/components/ScreenLayout";
import { useComponentLogger } from "@/src/shared/hooks/useComponentLogger";

import { useInvitesScreen } from "../hooks/useInvitesScreen";

export function InvitesScreen() {
  useComponentLogger("InvitesScreen");
  const router = useRouter();

  const {
    invitesByUser,
    fetchInvitesByUser,
    handleAcceptInvite,
    handleRejectInvite,
    error,
  } = useInvitesScreen();

  return (
    <ScreenLayout
      title="Meus Convites"
      subtitle={`${invitesByUser.length} ${invitesByUser.length === 1 ? "pendente" : "pendentes"}`}
    >
      <InvitesInboxContent
        error={error}
        invites={invitesByUser}
        onRetry={fetchInvitesByUser}
        onEmptyStatePress={() => router.push("/(userProfile)/profile")}
        onAcceptInvite={handleAcceptInvite}
        onRejectInvite={handleRejectInvite}
      />
    </ScreenLayout>
  );
}
