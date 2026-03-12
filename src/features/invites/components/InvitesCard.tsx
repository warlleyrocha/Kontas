import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

import { formatDate } from "@/src/utils/formats";

import { getInviteStatusStyle } from "../constants/inviteStatusStyles";
import type { Invite } from "../types/invite.types";

interface InvitesCardProps {
  readonly invite: Invite;
}

export function InvitesCard({ invite }: InvitesCardProps) {
  const statusStyle = getInviteStatusStyle(invite.status);

  return (
    <View className="mb-4 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <View className="flex-row items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
        <View className="flex-row items-center">
          <Ionicons
            name={statusStyle.iconName}
            size={20}
            color={statusStyle.iconColor}
          />
          <View
            className={`ml-2 rounded-full px-3 py-1 ${statusStyle.badgeColorClass}`}
          >
            <Text
              className={`text-xs font-semibold ${statusStyle.textColorClass}`}
            >
              {statusStyle.label}
            </Text>
          </View>
        </View>
      </View>

      <View className="p-4">
        <View className="mb-3 flex-row items-center">
          <Ionicons name="mail-outline" size={16} color="#6366F1" />
          <Text className="ml-2 text-base font-semibold text-gray-800">
            {invite.email}
          </Text>
        </View>

        <View className="mb-2 flex-row items-center">
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <Text className="ml-2 text-sm text-gray-500">
            Enviado em {formatDate(invite.criadoEm)}
          </Text>
        </View>

        {invite.atualizadoEm !== invite.criadoEm && (
          <View className="flex-row items-center">
            <Ionicons name="refresh-outline" size={14} color="#6B7280" />
            <Text className="ml-2 text-sm text-gray-500">
              Atualizado em {formatDate(invite.atualizadoEm)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
