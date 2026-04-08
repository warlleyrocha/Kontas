import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { formatDate } from "@/src/shared/utils/formats";
import { getInitials } from "@/src/shared/utils/getInitials";
import type { Invite } from "../types/invite.types";
import { getInviteStatusStyle } from "../constants/inviteStatusStyles";

interface InviteCardProps {
  readonly invite: Invite;
  readonly onAccept: () => void;
  readonly onReject: () => void;
}

export default function InviteCardMe({
  invite,
  onAccept,
  onReject,
}: InviteCardProps) {
  const statusStyle = getInviteStatusStyle(invite.status);
  return (
    <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
      <View className="p-4">
        <View className="flex-row items-center gap-3">
          <View className="h-[64px] w-[64px] overflow-hidden rounded-xl bg-gray-100 items-center justify-center">
            {invite.imagemRepublica ? (
              <Image
                source={{ uri: invite.imagemRepublica }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            ) : (
              <Text className="text-xl font-bold text-gray-400">
                {getInitials(invite.nomeRepublica)}
              </Text>
            )}
          </View>

          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-800">
              {invite.nomeRepublica}
            </Text>

            <View className="mt-1 flex-row items-center">
              <Ionicons name="person-outline" size={14} color="#6B7280" />
              <Text className="ml-1 text-sm text-gray-500">
                Convidado por {invite.nomeAdmin}
              </Text>
            </View>

            <View className="mt-1 flex-row items-center">
              <Ionicons name="calendar-outline" size={14} color="#6B7280" />
              <Text className="ml-1 text-sm text-gray-500">
                Recebido em: {formatDate(invite.criadoEm)}
              </Text>
            </View>
          </View>
        </View>

        {invite.status === "ACEITO" || invite.status === "RECUSADO" ? (
          <View className="mt-4 border-t border-teal/10 flex-row items-center gap-1 pt-2">
            <Ionicons
              name={statusStyle.iconName}
              size={15}
              color={statusStyle.iconColor}
            />
            <Text
              className={`text-sm font-semibold ${
                invite.status === "ACEITO" ? "text-teal" : "text-red-500"
              }`}
            >
              {invite.status === "ACEITO" ? `Aceito em ${formatDate(invite.atualizadoEm)}` : `Recusado em ${formatDate(invite.atualizadoEm)}`}
            </Text>
          </View>
        ) : (
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
        )}
      </View>
    </View>
  );
}