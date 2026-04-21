import type { ComponentProps } from "react";
import { ScrollView } from "react-native";

import { EmptyState } from "@/src/shared/components/EmptyState";
import type { Invite } from "../types/invite.types";
import { InviteCard } from "./InviteCard";

type InviteCardVariant = "received" | "sent";

type EmptyStateProps = Pick<
  ComponentProps<typeof EmptyState>,
  | "icon"
  | "iconColor"
  | "bgColor"
  | "title"
  | "description"
  | "buttonText"
  | "onPress"
>;

interface InviteListProps {
  readonly error: string | null;
  readonly invites: Invite[];
  readonly onRetry: () => void;
  readonly emptyState: EmptyStateProps;
  readonly variant: InviteCardVariant;
  readonly onAcceptInvite?: (inviteId: string, republicId: string) => void;
  readonly onRejectInvite?: (inviteId: string) => void;
}

export function InviteList({
  error,
  invites,
  onRetry,
  emptyState,
  variant,
  onAcceptInvite,
  onRejectInvite,
}: InviteListProps) {
  if (error) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        iconColor="#EF4444"
        bgColor="bg-red-50"
        title="Não foi possível carregar os convites"
        description={error}
        buttonText="Tentar novamente"
        onPress={onRetry}
      />
    );
  }

  if (invites.length === 0) {
    return <EmptyState {...emptyState} />;
  }

  return (
    <ScrollView className="flex-1 bg-teal/5 px-4 pt-4">
      {invites.map((invite) => (
        <InviteCard
          key={invite.id}
          invite={invite}
          variant={variant}
          onAccept={
            onAcceptInvite
              ? () => onAcceptInvite(invite.id, invite.republicaId)
              : undefined
          }
          onReject={
            onRejectInvite ? () => onRejectInvite(invite.id) : undefined
          }
        />
      ))}
    </ScrollView>
  );
}
