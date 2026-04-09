import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, TouchableOpacity, View } from "react-native";
import {
  Invite,
  StatusInvite,
} from "@/src/features/invites/types/invite.types";
import { formatDate } from "@/src/shared/utils/formats";
import { getInviteStatusStyle } from "../constants/inviteStatusStyles";

interface InviteCardFooterProps {
  readonly invite: Invite;
  readonly variant: "received" | "sent";
  readonly onAccept?: () => void;
  readonly onReject?: () => void;
}

export function InviteCardFooter({
  invite,
  variant,
  onAccept,
  onReject,
}: InviteCardFooterProps) {
  const isReceived = variant === "received";
  const showActions = isReceived && invite.status === StatusInvite.PENDENTE;
  const statusStyle = getInviteStatusStyle(invite.status);

  if (showActions) {
    return (
      <View className="mt-4 flex-row gap-3">
        <TouchableOpacity
          onPress={onReject}
          accessibilityRole="button"
          accessibilityLabel={`Recusar convite de ${invite.republicaId}`}
          className="flex-1 flex-row items-center justify-center rounded-xl border border-gray-200 bg-gray-50 py-3"
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={18} color="#6B7280" />
          <Text className="ml-1 font-semibold text-gray-600">Recusar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onAccept}
          accessibilityRole="button"
          accessibilityLabel={`Aceitar convite de ${invite.republicaId}`}
          className="flex-1 flex-row items-center justify-center rounded-xl bg-teal py-3"
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark" size={18} color="white" />
          <Text className="ml-1 font-semibold text-white">Aceitar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (invite.status === StatusInvite.PENDENTE && !isReceived) {
    const dateLabel =
      invite.atualizadoEm !== invite.criadoEm
        ? ` em ${formatDate(invite.atualizadoEm)}`
        : "";
    return (
      <View className="border-t border-teal/10 gap-1 pt-3 flex-row items-center">
        <Ionicons
          name={statusStyle.iconName}
          size={15}
          color={statusStyle.iconColor}
        />
        <Text className={`text-sm font-semibold ${statusStyle.textColorClass}`}>
          {statusStyle.label}
          {dateLabel}
        </Text>
      </View>
    );
  }

  return null;
}
