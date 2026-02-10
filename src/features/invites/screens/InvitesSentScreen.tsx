import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { MenuButton, SideMenu } from "@/src/components/SideMenu";
import { EmptyState } from "@/src/components/EmptyState";

import { InvitesCard } from "../components/InvitesCard";
import { useInvitesScreen } from "../hooks/useInvitesScreen";
import { useInvites } from "../hooks/useInvite";

interface InvitesSentScreenProps {
  readonly republicId: string;
}

export function InvitesSentScreen({ republicId }: InvitesSentScreenProps) {
  const router = useRouter();
  const { invites, fetchInvites, error } = useInvites();
  const { isMenuOpen, setIsMenuOpen, menuItems, footerItems, sideMenuUser } =
    useInvitesScreen();

  useEffect(() => {
    fetchInvites(republicId);
  }, [fetchInvites, republicId]);

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
          onPress={() => fetchInvites(republicId)}
        />
      );
    }

    if (invites.length === 0) {
      return (
        <EmptyState
          icon="paper-plane-outline"
          iconColor="#9CA3AF"
          bgColor="bg-gray-100"
          title="Nenhum convite enviado"
          description="Você ainda não enviou convites para esta república. Convide pessoas para se juntarem a você!"
          buttonText="Voltar"
          onPress={() => router.back()}
        />
      );
    }

    return (
      <ScrollView className="flex-1 px-4 pt-4">
        {invites.map((invite) => (
          <InvitesCard key={invite.id} invite={invite} />
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
          <Text className="text-lg font-semibold">Convites Enviados</Text>
          <Text className="text-sm text-gray-500">
            {invites.length} {invites.length === 1 ? "convite" : "convites"}
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
