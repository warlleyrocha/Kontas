import type { Invite } from "../types/invite.types";
import { InviteListContentBase } from "./InviteListContentBase";
import { InvitesCard } from "./InvitesCard";

interface InvitesSentContentProps {
  readonly error: string | null;
  readonly invites: Invite[];
  readonly onRetry: () => void;
  readonly onEmptyStatePress: () => void;
}

export function InvitesSentContent({
  error,
  invites,
  onRetry,
  onEmptyStatePress,
}: InvitesSentContentProps) {
  return (
    <InviteListContentBase
      error={error}
      hasItems={invites.length > 0}
      onRetry={onRetry}
      emptyState={{
        icon: "paper-plane-outline",
        iconColor: "#337176",
        bgColor: "bg-teal/10",
        title: "Nenhum convite enviado",
        description:
          "Você ainda não enviou convites para esta república. Convide pessoas para se juntarem a você!",
        buttonText: "Voltar",
        onPress: onEmptyStatePress,
      }}
    >
      {invites.map((invite) => (
        <InvitesCard key={invite.id} invite={invite} />
      ))}
    </InviteListContentBase>
  );
}
