import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { InvitesSentContent } from "../components/InvitesSentContent";
import { useInvites } from "../hooks/useInvite";

interface InvitesSentScreenProps {
  readonly republicId: string;
}

export function InvitesSentScreen({ republicId }: InvitesSentScreenProps) {
  const router = useRouter();
  const { invites, fetchInvites, error } = useInvites();

  useEffect(() => {
    fetchInvites(republicId);
  }, [fetchInvites, republicId]);

  return (
    <View className="flex-1 bg-[#FAFAFA]">
      <View className="mt-[32px] flex-row items-center gap-3 border-b border-b-black/10 bg-[#FAFAFA] px-[16px] py-4">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>

        <View className="flex-1">
          <Text className="text-lg font-semibold">Convites Enviados</Text>
          <Text className="text-sm text-gray-500">
            {invites.length} {invites.length === 1 ? "convite" : "convites"}
          </Text>
        </View>
      </View>

      <InvitesSentContent
        error={error}
        invites={invites}
        onRetry={() => fetchInvites(republicId)}
        onEmptyStatePress={() => router.back()}
      />
    </View>
  );
}
