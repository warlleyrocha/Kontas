import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { StatusInvite } from "@/src/features/invites/types/invite.types";
import { formatDate } from "@/src/shared/utils/formats";
import { getInitials } from "@/src/shared/utils/getInitials";

import { getInviteStatusStyle } from "../constants/inviteStatusStyles";
import type { Invite } from "../types/invite.types";

type InviteCardVariant = "received" | "sent";

interface InviteCardProps {
  readonly invite: Invite;
  readonly variant: InviteCardVariant;
  readonly onAccept?: () => void;
  readonly onReject?: () => void;
}

export function InviteCard({
  invite,
  variant,
  onAccept,
  onReject,
}: InviteCardProps) {
  const statusStyle = getInviteStatusStyle(invite.status);

  const isReceived = variant === "received";
  const title = isReceived ? invite.nomeRepublica : invite.nomeMorador;
  const imageSource = isReceived
    ? invite.imagemRepublica
    : invite.imagemMorador;
  const infoExtra = isReceived
    ? `Convidado por ${invite.nomeAdmin}`
    : undefined;
  const dateLabel = isReceived ? "Recebido em:" : "Enviado em";
  const showActions = isReceived && invite.status === StatusInvite.PENDENTE;

  function renderFooter() {
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
      return (
        <View className="border-t border-teal/10 gap-1 pt-3 flex-row items-center">
          <Ionicons
            name={statusStyle.iconName}
            size={15}
            color={statusStyle.iconColor}
          />
          <Text
            className={`text-sm font-semibold ${statusStyle.textColorClass}`}
          >
            {statusStyle.label}
          </Text>
        </View>
      );
    }

    if (invite.atualizadoEm !== invite.criadoEm) {
      return (
        <View className="border-t border-teal/10 pt-3 flex-row items-center">
          <Ionicons
            name={statusStyle.iconName}
            size={15}
            color={statusStyle.iconColor}
          />
          <Text
            className={`ml-1 text-sm font-semibold ${statusStyle.textColorClass}`}
          >
            {statusStyle.label} em {formatDate(invite.atualizadoEm)}
          </Text>
        </View>
      );
    }

    return null;
  }

  return (
    <View className="mb-4 overflow-hidden rounded-2xl border border-teal/10 bg-white shadow-lg shadow-teal/20">
      <View className="p-4">
        <View className="mb-3 flex-row items-center">
          {imageSource ? (
            <Image
              source={{ uri: imageSource }}
              className="mr-3 h-16 w-16 rounded-xl border border-teal/20"
            />
          ) : (
            <View className="mr-3 h-16 w-16 items-center justify-center rounded-xl border border-teal/20 bg-teal/10">
              <Text className="text-lg font-bold text-teal">
                {getInitials(title)}
              </Text>
            </View>
          )}

          <View className="flex-1">
            <View className="flex-row items-center">
              <Ionicons
                name={isReceived ? "home-outline" : "person-outline"}
                size={14}
                color="#6B7280"
              />
              <Text className="ml-[5px] text-base font-semibold text-teal-dark">
                {title}
              </Text>
            </View>

            {infoExtra && (
              <View className="mt-1 flex-row items-center">
                <Ionicons name="at" size={14} color="#6B7280" />
                <Text className="ml-1 text-sm text-gray-500">{infoExtra}</Text>
              </View>
            )}

            <View className="mt-1 flex-row items-center">
              <Ionicons name="calendar-outline" size={14} color="#6B7280" />
              <Text className="ml-2 text-sm text-teal">
                {dateLabel} {formatDate(invite.criadoEm)}
              </Text>
            </View>
          </View>
        </View>

        {renderFooter()}
      </View>
    </View>
  );
}
