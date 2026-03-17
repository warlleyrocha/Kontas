import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

import { InvitesInboxContent } from "@/src/features/invites/components/InvitesInboxContent";

import { useComponentLogger } from "@/src/shared/hooks/useComponentLogger";
import { useInvitesScreen } from "../hooks/useInvitesScreen";

export function InvitesScreen() {
  useComponentLogger("InvitesScreen");
  const router = useRouter();

  const {
    invitesByUser,
    fetchInvitesByUser,
    handleAcceptInvite,
    handleRejectInvite,
    error,
  } = useInvitesScreen();

  return (
    <View className="flex-1 bg-[#FAFAFA]">
      <View className="mt-[32px] flex-row items-center gap-3 border-b border-b-black/10 bg-[#FAFAFA] px-[16px] py-4">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>

        <View className="flex-1">
          <Text className="text-lg font-semibold">Meus Convites</Text>
          <Text className="text-sm text-gray-500">
            {invitesByUser.length}{" "}
            {invitesByUser.length === 1 ? "pendente" : "pendentes"}
          </Text>
        </View>
      </View>

      <InvitesInboxContent
        error={error}
        invites={invitesByUser}
        onRetry={fetchInvitesByUser}
        onEmptyStatePress={() => router.push("/(userProfile)/profile")}
        onAcceptInvite={handleAcceptInvite}
        onRejectInvite={handleRejectInvite}
      />
    </View>
  );
}
