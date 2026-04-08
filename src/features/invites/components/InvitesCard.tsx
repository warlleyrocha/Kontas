import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, Text, View } from "react-native";

import { formatDate } from "@/src/shared/utils/formats";
import { getInitials } from "@/src/shared/utils/getInitials";
import { getInviteStatusStyle } from "../constants/inviteStatusStyles";


import type { Invite } from "../types/invite.types";
import { StatusInvite } from "../types/invite.types";

interface InvitesCardProps {
  readonly invite: Invite;
}

export function InvitesCard({ invite }: InvitesCardProps) {
  const statusStyle = getInviteStatusStyle(invite.status);

  return (
    <View className="mb-4 overflow-hidden rounded-2xl border border-teal/10 bg-white shadow-lg shadow-teal/20">
      

      <View className="p-4">
        <View className="mb-3 flex-row items-center">
          {invite.imagemMorador ? (
            <Image
              source={{ uri: invite.imagemMorador }}
              className="mr-3 h-16 w-16 rounded-xl border border-teal/20"
              onError={(e) => e.currentTarget.setNativeProps({ source: null })}
            />
          ) : (
            <View className="mr-3 h-16 w-16 items-center justify-center rounded-full border border-teal/20 bg-teal/10">
              <Text className="text-lg font-bold text-teal">{getInitials(invite.nomeMorador)}</Text>
            </View>
          )}

          <View className="flex-1">
            <View className="flex-row items-center">
              <Ionicons name="person-outline" size={14} color="#6B7280" />
              <Text className="ml-2 text-base font-semibold text-teal-dark">
                {invite.nomeMorador}
              </Text>
            </View>
            

            <View className="mt-1 flex-row items-center">
              <Ionicons name="calendar-outline" size={14} color="#6B7280" />
              <Text className="ml-2 text-sm text-teal">
                Enviado em {formatDate(invite.criadoEm)}
              </Text>
            </View>
          </View>
        </View>

        {invite.status === StatusInvite.PENDENTE ? (
          <View className="border-t border-teal/10 gap-1 pt-3 flex-row items-center">
            <Ionicons
              name={statusStyle.iconName}
              size={15}
              color={statusStyle.iconColor}
            />
            <Text className={`text-sm font-semibold ${statusStyle.textColorClass}`}>
              {statusStyle.label}
            </Text>
          </View>
        ) : (
          invite.atualizadoEm !== invite.criadoEm && (
            <View className="border-t border-teal/10 pt-3 flex-row items-center">
              <Ionicons
                name={statusStyle.iconName}
                size={15}
                color={statusStyle.iconColor}
              />
              <Text className={`ml-1 text-sm font-semibold ${statusStyle.textColorClass}`}>
                {statusStyle.label} em {formatDate(invite.atualizadoEm)}
              </Text>
            </View>
          )
        )}
      </View>
    </View>
  );
}
