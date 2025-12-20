import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { EditProfileModal } from "@/components/EditProfileModal";
import { MenuButton, SideMenu } from "@/components/SideMenu";
import { useAuth } from "@/contexts";

// Mock de repúblicas cadastradas
const mockRepublicas = [
  {
    id: "1",
    nome: "República dos Estudantes",
    imagem:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400",
    moradores: 5,
  },
  {
    id: "2",
    nome: "Casa Verde",
    imagem: null,
    moradores: 3,
  },
];

interface RepublicaCardProps {
  readonly republica: {
    readonly id: string;
    readonly nome: string;
    readonly imagem: string | null;
    readonly moradores: number;
  };
  readonly onEdit: () => void;
  readonly onSelect: () => void;
}

function RepublicaCard({ republica, onEdit, onSelect }: RepublicaCardProps) {
  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.9}
      className="mb-4 w-44 overflow-hidden rounded-3xl bg-white shadow-sm"
    >
      {/* Imagem */}
      <View className="h-36 w-full items-center justify-center overflow-hidden bg-gray-100">
        {republica.imagem ? (
          <Image
            source={{ uri: republica.imagem }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        ) : (
          <Text className="text-5xl">🏠</Text>
        )}
      </View>

      {/* Info */}
      <View className="p-4">
        <Text className="text-lg font-bold text-gray-800" numberOfLines={2}>
          {republica.nome}
        </Text>

        <View className="mt-2 flex-row items-center justify-between">
          <Text className="text-sm font-medium text-blue-500">
            {republica.moradores}{" "}
            {republica.moradores === 1 ? "morador" : "moradores"}
          </Text>

          <TouchableOpacity
            onPress={onEdit}
            className="rounded-full bg-blue-100 p-2"
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={16} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

interface ProfileData {
  name: string;
  email: string;
  photo?: string;
  pixKey: string;
}

export default function SetupProfile() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const [menuVisible, setMenuVisible] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  // Simula se o usuário tem repúblicas (mude para [] para testar estado vazio)
  const [republicas] = useState<any[]>(mockRepublicas);

  // Estado local para dados do perfil
  const [profile, setProfile] = useState<ProfileData>({
    name: user?.user.name ?? "",
    email: user?.user.email ?? "",
    pixKey: "",
    photo: user?.user.photo ?? undefined,
  });

  const handleCreateRepublic = () => {
    router.push("/register/republic");
  };

  const handleEditRepublic = (id: string) => {
    console.log("Editar república:", id);
  };

  const handleSelectRepublic = (id: string) => {
    console.log("Selecionar república:", id);
    router.push("/home");
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  const menuItems = [
    {
      id: "1",
      label: "Início",
      icon: "home-outline" as const,
      onPress: () => router.push("/(userProfile)/profile"),
    },
    {
      id: "2",
      label: "Convites",
      icon: "mail-outline" as const,
      onPress: () => router.push("/(userProfile)/invites"),
    },
    {
      id: "3",
      label: "Configurações",
      icon: "settings-outline" as const,
      onPress: () => router.push("/register/republic"),
    },
  ];

  const footerItems = [
    {
      id: "1",
      label: "Sair",
      icon: "log-out-outline" as const,
      onPress: handleSignOut,
      danger: true,
    },
  ];

  // Função para salvar perfil editado
  const handleSaveProfile = (
    name: string,
    email: string,
    pixKey?: string,
    photo?: string
  ) => {
    setProfile({ name, email, pixKey: pixKey ?? "", photo });
    setShowEditProfileModal(false);
  };

  return (
    <View className="flex-1 bg-[#FAFAFA]">
      {/* HEADER */}
      <View className="mt-[24px] flex-row items-center gap-3 border-b border-b-black/10 bg-[#FAFAFA]  px-[16px] py-4">
        <View className="h-[50px] w-[50px] items-center justify-center overflow-hidden rounded-full bg-gray-200">
          {profile.photo ? (
            <Image
              source={{ uri: profile.photo }}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
              }}
              resizeMode="cover"
            />
          ) : (
            <Text className="text-xl font-bold text-gray-500">
              {profile.name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        <TouchableOpacity
          className="flex-1"
          onPress={() => setShowEditProfileModal(true)}
        >
          <Text className="text-base font-semibold">{profile.name}</Text>
          <Text className="text-sm text-gray-500">Configurar perfil</Text>
        </TouchableOpacity>

        <MenuButton onPress={() => setMenuVisible(true)} />
      </View>

      {/* CONTENT */}
      {republicas.length > 0 ? (
        <ScrollView className="flex-1 px-6 pt-6">
          <Text className="mb-4 text-lg font-semibold text-gray-800">
            Suas Repúblicas
          </Text>

          <View className="flex-row flex-wrap gap-4">
            {republicas.map((republica) => (
              <RepublicaCard
                key={republica.id}
                republica={republica}
                onEdit={() => handleEditRepublic(republica.id)}
                onSelect={() => handleSelectRepublic(republica.id)}
              />
            ))}
          </View>

          <TouchableOpacity
            onPress={handleCreateRepublic}
            className="mb-6 mt-2 flex-row items-center justify-center rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50 px-6 py-4"
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={24} color="#6366F1" />
            <Text className="ml-2 text-base font-semibold text-indigo-600">
              Adicionar Nova República
            </Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center px-6">
          <View className="mb-8 h-24 w-24 items-center justify-center rounded-full bg-gray-100">
            <Text className="text-4xl">🏠</Text>
          </View>

          <Text className="mb-2 text-center text-xl font-bold text-gray-800">
            Nenhuma república vinculada
          </Text>

          <Text className="mb-8 text-center text-base text-gray-500">
            Você ainda não possui uma república cadastrada. Crie uma nova para
            começar a gerenciar as contas e moradores.
          </Text>

          <TouchableOpacity
            onPress={handleCreateRepublic}
            className="w-full rounded-lg bg-indigo-600 px-6 py-4"
            activeOpacity={0.8}
          >
            <Text className="text-center text-base font-semibold text-white">
              Cadastrar Nova República
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MENU LATERAL */}
      <SideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        user={{ name: profile.name, photo: profile.photo }}
        menuItems={menuItems}
        footerItems={footerItems}
      />

      {/* MODAL CONFIGURAR PERFIL */}
      <EditProfileModal
        visible={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        currentName={profile.name}
        currentEmail={profile.email}
        currentPixKey={profile.pixKey}
        currentPhoto={profile.photo}
        onSave={handleSaveProfile}
      />
    </View>
  );
}
