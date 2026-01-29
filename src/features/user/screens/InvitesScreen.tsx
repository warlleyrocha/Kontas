import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { MenuButton, SideMenu } from "@/src/components/SideMenu";
import { formatDate } from "@/src/utils/formats";

import { useInvitesScreen } from "../hooks/useInvitesScreen";

interface InviteCardProps {
  readonly invite: {
    readonly id: string;
    readonly republicaNome: string;
    readonly republicaImagem: string | null;
    readonly convidadoPor: string;
    readonly dataConvite: string;
    readonly moradores: number;
  };
  readonly onAccept: () => void;
  readonly onReject: () => void;
}

function InviteCard({ invite, onAccept, onReject }: InviteCardProps) {
  return (
    <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
      <View className="h-28 w-full items-center justify-center overflow-hidden bg-gray-100">
        {invite.republicaImagem ? (
          <Image
            source={{ uri: invite.republicaImagem }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        ) : (
          <Text className="text-4xl">🏠</Text>
        )}
      </View>

      <View className="p-4">
        <Text className="text-lg font-bold text-gray-800">
          {invite.republicaNome}
        </Text>

        <View className="mt-1 flex-row items-center">
          <Ionicons name="people-outline" size={14} color="#6B7280" />
          <Text className="ml-1 text-sm text-gray-500">
            {invite.moradores} moradores
          </Text>
        </View>

        <View className="mt-2 flex-row items-center">
          <Ionicons name="person-outline" size={14} color="#6B7280" />
          <Text className="ml-1 text-sm text-gray-500">
            Convidado por {invite.convidadoPor}
          </Text>
        </View>

        <View className="mt-1 flex-row items-center">
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <Text className="ml-1 text-sm text-gray-500">
            {formatDate(invite.dataConvite)}
          </Text>
        </View>

        <View className="mt-4 flex-row gap-3">
          <TouchableOpacity
            onPress={onReject}
            className="flex-1 flex-row items-center justify-center rounded-xl border border-gray-200 bg-gray-50 py-3"
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={18} color="#6B7280" />
            <Text className="ml-1 font-semibold text-gray-600">Recusar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onAccept}
            className="flex-1 flex-row items-center justify-center rounded-xl bg-indigo-600 py-3"
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark" size={18} color="white" />
            <Text className="ml-1 font-semibold text-white">Aceitar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export function InvitesScreen() {
  const router = useRouter();
  const {
    invites,
    isMenuOpen,
    setIsMenuOpen,
    handleAcceptInvite,
    handleRejectInvite,
    menuItems,
    footerItems,
    sideMenuUser,
  } = useInvitesScreen();

  return (
    <View className="flex-1 bg-[#FAFAFA]">
      <View className="mt-[32px] flex-row items-center gap-3 border-b border-b-black/10 bg-[#FAFAFA] px-[16px] py-4">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>

        <View className="flex-1">
          <Text className="text-lg font-semibold">Convites</Text>
          <Text className="text-sm text-gray-500">
            {invites.length} {invites.length === 1 ? "pendente" : "pendentes"}
          </Text>
        </View>

        <MenuButton onPress={() => setIsMenuOpen(true)} />
      </View>

      {invites.length > 0 ? (
        <ScrollView className="flex-1 px-4 pt-4">
          {invites.map((invite) => (
            <InviteCard
              key={invite.id}
              invite={invite}
              onAccept={() => handleAcceptInvite(invite.id)}
              onReject={() => handleRejectInvite(invite.id)}
            />
          ))}
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center px-6">
          <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-gray-100">
            <Ionicons name="mail-open-outline" size={48} color="#9CA3AF" />
          </View>

          <Text className="mb-2 text-center text-xl font-bold text-gray-800">
            Nenhum convite pendente
          </Text>

          <Text className="mb-8 text-center text-base text-gray-500">
            Quando alguém te convidar para uma república, o convite aparecerá
            aqui.
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/(userProfile)/profile")}
            className="flex-row items-center rounded-xl bg-indigo-600 px-6 py-3"
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={18} color="white" />
            <Text className="ml-2 font-semibold text-white">
              Voltar ao Perfil
            </Text>
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
