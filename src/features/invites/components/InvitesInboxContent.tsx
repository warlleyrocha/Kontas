import type { GetInvitesByUser } from "../types/invite.types";
import InviteCardMe from "./InviteCardMe";
import { InviteListContentBase } from "./InviteListContentBase";

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
      hasItems={invites.length > 0}
      onRetry={onRetry}
      emptyState={{
        icon: "mail-open-outline",
        iconColor: "#337176",
        bgColor: "bg-teal/10",
        title: "Nenhum convite pendente",
        description:
          "Quando alguém te convidar para uma república, o convite aparecerá aqui.",
        buttonText: "Voltar ao Perfil",
        onPress: onEmptyStatePress,
      }}
    >
      {invites.map((invite) => (
        <InviteCardMe
          key={invite.id}
          invite={invite}
          onAccept={() => onAcceptInvite(invite.id, invite.republicaId)}
          onReject={() => onRejectInvite(invite.id)}
        />
      ))}
    </InviteListContentBase>
  );
}
