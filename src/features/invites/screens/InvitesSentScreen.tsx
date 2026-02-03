import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { MenuButton, SideMenu } from "@/src/components/SideMenu";

import { InvitesCard } from "../components/InvitesCard";
import { useInvitesScreen } from "../hooks/useInvitesScreen";
import { useInvites } from "../hooks/useInvite";

interface InvitesSentScreenProps {
  readonly republicId: string;
}

export function InvitesSentScreen({ republicId }: InvitesSentScreenProps) {
  const router = useRouter();
  const { invites, fetchInvites } = useInvites();
  const { isMenuOpen, setIsMenuOpen, menuItems, footerItems, sideMenuUser } =
    useInvitesScreen();

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

        <MenuButton onPress={() => setIsMenuOpen(true)} />
      </View>

      {invites.length > 0 ? (
        <ScrollView className="flex-1 px-4 pt-4">
          {invites.map((invite) => (
            <InvitesCard key={invite.id} invite={invite} />
          ))}
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center px-6">
          <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-gray-100">
            <Ionicons name="paper-plane-outline" size={48} color="#9CA3AF" />
          </View>

          <Text className="mb-2 text-center text-xl font-bold text-gray-800">
            Nenhum convite enviado
          </Text>

          <Text className="mb-8 text-center text-base text-gray-500">
            Você ainda não enviou convites para esta república. Convide pessoas
            para se juntarem a você!
          </Text>

          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center rounded-xl bg-indigo-600 px-6 py-3"
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={18} color="white" />
            <Text className="ml-2 font-semibold text-white">Voltar</Text>
          </TouchableOpacity>
        </View>
      )}

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
