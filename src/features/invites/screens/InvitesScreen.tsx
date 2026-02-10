import React, { useEffect } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { MenuButton, SideMenu } from "@/src/components/SideMenu";
import { EmptyState } from "@/src/components/EmptyState";
import InviteCardMe from "@/src/features/invites/components/InviteCardMe";
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

  // Determina qual conteúdo renderizar
  const renderContent = () => {
    if (error) {
      return (
        <EmptyState
          icon="alert-circle-outline"
          iconColor="#EF4444"
          bgColor="bg-red-50"
          title="Não foi possível carregar os convites"
          description={error}
          buttonText="Tentar novamente"
          onPress={fetchInvitesByUser}
        />
      );
    }

    if (invitesByUser.length === 0) {
      return (
        <EmptyState
          icon="mail-open-outline"
          iconColor="#9CA3AF"
          bgColor="bg-gray-100"
          title="Nenhum convite pendente"
          description="Quando alguém te convidar para uma república, o convite aparecerá aqui."
          buttonText="Voltar ao Perfil"
          onPress={() => router.push("/(userProfile)/profile")}
        />
      );
    }

    return (
      <ScrollView className="flex-1 px-4 pt-4">
        {invitesByUser.map((invite) => (
          <InviteCardMe
            key={invite.id}
            invite={invite}
            onAccept={() => handleAcceptInvite(invite.id, invite.republicaId)}
            onReject={() => handleRejectInvite(invite.id)}
          />
        ))}
      </ScrollView>
    );
  };

  return (
    <View className="flex-1 bg-[#FAFAFA]">
      <View className="mt-[32px] flex-row items-center gap-3 border-b border-b-black/10 bg-[#FAFAFA] px-[16px] py-4">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>

        <View className="flex-1">
          <Text className="text-lg font-semibold">Convites</Text>
          <Text className="text-sm text-gray-500">
            {fetchInvitesByUser.length}{" "}
            {fetchInvitesByUser.length === 1 ? "pendente" : "pendentes"}
          </Text>
        </View>

        <MenuButton onPress={() => setIsMenuOpen(true)} />
      </View>

      {renderContent()}

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
