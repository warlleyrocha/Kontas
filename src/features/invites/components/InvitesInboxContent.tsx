import type { GetInvitesByUser } from "../types/invite.types";
import { InviteListContentBase } from "./InviteListContentBase";
import InviteCardMe from "./InviteCardMe";

interface InvitesInboxContentProps {
  readonly error: string | null;
  readonly invites: GetInvitesByUser[];
  readonly onRetry: () => void;
  readonly onEmptyStatePress: () => void;
  readonly onAcceptInvite: (inviteId: string, republicId: string) => void;
  readonly onRejectInvite: (inviteId: string) => void;
}

export function InvitesInboxContent({
  error,
  invites,
  onRetry,
  onEmptyStatePress,
  onAcceptInvite,
  onRejectInvite,
}: InvitesInboxContentProps) {
  return (
    <InviteListContentBase
      error={error}
      items={invites}
      onRetry={onRetry}
      emptyState={{
        icon: "mail-open-outline",
        iconColor: "#9CA3AF",
        bgColor: "bg-gray-100",
        title: "Nenhum convite pendente",
        description:
          "Quando alguém te convidar para uma república, o convite aparecerá aqui.",
        buttonText: "Voltar ao Perfil",
        onPress: onEmptyStatePress,
      }}
      keyExtractor={(invite) => invite.id}
      renderItem={(invite) => (
        <InviteCardMe
          invite={invite}
          onAccept={() => onAcceptInvite(invite.id, invite.republicaId)}
          onReject={() => onRejectInvite(invite.id)}
        />
      )}
    />
  );
}
