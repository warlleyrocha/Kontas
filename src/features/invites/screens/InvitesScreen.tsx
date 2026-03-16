import React, { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

import { MenuButton, SideMenu } from "@/src/shared/components/SideMenu";
import { InvitesInboxContent } from "@/src/features/invites/components/InvitesInboxContent";
import { useInvitesScreen } from "../hooks/useInvitesScreen";
import { useInvites } from "../hooks/useInvite";

export function InvitesScreen() {
  const router = useRouter();

  const {
    invitesByUser,
    fetchInvitesByUser,
    handleAcceptInvite,
    handleRejectInvite,
    error,
  } = useInvites();
  const { isMenuOpen, setIsMenuOpen, menuItems, footerItems, sideMenuUser } =
    useInvitesScreen();

  useEffect(() => {
    fetchInvitesByUser();
  }, [fetchInvitesByUser]);

  return (
    <View className="flex-1 bg-[#FAFAFA]">
      <View className="mt-[32px] flex-row items-center gap-3 border-b border-b-black/10 bg-[#FAFAFA] px-[16px] py-4">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>

        <View className="flex-1">
          <Text className="text-lg font-semibold">Convites</Text>
          <Text className="text-sm text-gray-500">
            {invitesByUser.length}{" "}
            {invitesByUser.length === 1 ? "pendente" : "pendentes"}
          </Text>
        </View>

        <MenuButton onPress={() => setIsMenuOpen(true)} />
      </View>

      <InvitesInboxContent
        error={error}
        invites={invitesByUser}
        onRetry={fetchInvitesByUser}
        onEmptyStatePress={() => router.push("/(userProfile)/profile")}
        onAcceptInvite={handleAcceptInvite}
        onRejectInvite={handleRejectInvite}
      />

      {isMenuOpen && sideMenuUser && (
        <SideMenu
          onRequestClose={() => setIsMenuOpen(false)}
          user={sideMenuUser}
          menuItems={menuItems}
          footerItems={footerItems}
        />
      )}
    </View>
  );
}
