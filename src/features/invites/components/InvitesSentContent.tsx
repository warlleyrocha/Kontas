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
      items={invites}
      onRetry={onRetry}
      emptyState={{
        icon: "paper-plane-outline",
        iconColor: "#9CA3AF",
        bgColor: "bg-gray-100",
        title: "Nenhum convite enviado",
        description:
          "Você ainda não enviou convites para esta república. Convide pessoas para se juntarem a você!",
        buttonText: "Voltar",
        onPress: onEmptyStatePress,
      }}
      keyExtractor={(invite) => invite.id}
      renderItem={(invite) => <InvitesCard invite={invite} />}
    />
  );
}
