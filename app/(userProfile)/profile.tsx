import {
  PROFILE_COMPLETE_STORAGE_KEY,
  USER_PROFILE_STORAGE_KEY,
} from "@/constants/storageKeys";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { EditProfileModal } from "@/components/Modals/EditProfileModal";
import RepublicCard from "@/components/RepublicCard";
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

interface ProfileData {
  name: string;
  email: string;
  photo?: string;
  pixKey: string;
  phone?: string;
}

export default function SetupProfile() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const [menuVisible, setMenuVisible] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  // Simula se o usuário tem repúblicas (mude para [] para testar estado vazio)
  const [republicas] = useState<any[]>([]);

  // Estado local para dados do perfil
  const [profile, setProfile] = useState<ProfileData>({
    name: user?.user.name ?? "",
    email: user?.user.email ?? "",
    pixKey: "",
    photo: user?.user.photo ?? undefined,
    phone: "",
  });

  // Carrega dados do perfil do AsyncStorage ao montar
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const stored = await AsyncStorage.getItem(USER_PROFILE_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setProfile((prev) => ({
            ...prev,
            ...parsed,
          }));
        }
      } catch (e) {
        // erro ao carregar perfil
      }
    };
    loadProfile();
  }, []);

  // Estado para flag de perfil completo
  const [profileComplete, setProfileComplete] = useState(false);

  // Verifica se o perfil está completo ao carregar ou fechar o modal
  useEffect(() => {
    const checkProfileComplete = async () => {
      const flag = await AsyncStorage.getItem(PROFILE_COMPLETE_STORAGE_KEY);
      setProfileComplete(flag === "true");
    };
    checkProfileComplete();
  }, [showEditProfileModal]);

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
      onPress: () => router.push("/(userProfile)/settings"),
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
  const handleSaveProfile = async (
    name: string,
    email: string,
    pixKey?: string,
    photo?: string,
    phone?: string
  ) => {
    const newProfile = { name, email, pixKey: pixKey ?? "", photo, phone };
    setProfile(newProfile);
    // Salva dados do perfil no AsyncStorage
    await AsyncStorage.setItem(
      USER_PROFILE_STORAGE_KEY,
      JSON.stringify(newProfile)
    );
    // Se telefone e chave Pix preenchidos, salva a flag de perfil completo
    if (phone && pixKey) {
      await AsyncStorage.setItem(PROFILE_COMPLETE_STORAGE_KEY, "true");
      setProfileComplete(true);
    }
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
      {!profileComplete ? (
        // 1. PERFIL INCOMPLETO - Mostra card de completar perfil
        <View className="mt-[-30px] flex-1 items-center justify-center bg-gradient-to-b from-slate-50 to-white px-6">
          <View className="w-full max-w-md">
            <View className="rounded-3xl bg-white p-8 shadow-2xl shadow-gray-900/5">
              <View className="mb-4 self-start rounded-full bg-indigo-50 px-4 py-2">
                <Text className="text-xs font-semibold text-indigo-600">
                  QUASE LÁ!
                </Text>
              </View>

              <Text className="mb-3 text-2xl font-bold leading-tight text-gray-900">
                Complete seu perfil
              </Text>

              <Text className="mb-8 text-base leading-relaxed text-gray-600">
                Cadastre sua chave PIX e telefone para desbloquear todos os
                recursos e participar de repúblicas.
              </Text>

              <TouchableOpacity
                onPress={() => setShowEditProfileModal(true)}
                className="w-full overflow-hidden rounded-2xl bg-indigo-600 px-6 py-4 shadow-lg hover:shadow-indigo-300/30 active:scale-95"
                activeOpacity={0.9}
              >
                <Text className="text-center text-[16px] font-bold text-white">
                  Continuar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : republicas.length > 0 ? (
        // 2. PERFIL COMPLETO + TEM REPÚBLICAS - Mostra lista
        <ScrollView className="flex-1 px-6 pt-6">
          <Text className="mb-4 text-lg font-semibold text-gray-800">
            Suas Repúblicas
          </Text>

          <View className="flex-row flex-wrap gap-4">
            {republicas.map((republica) => (
              <RepublicCard
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
        // 3. PERFIL COMPLETO + SEM REPÚBLICAS - Mostra card vazio
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-full max-w-md">
            <View className="rounded-3xl bg-white p-8 shadow-lg">
              {/* Ícone ilustrativo */}
              <View className="mb-6 items-center">
                <View className="h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                  <Text className="text-4xl">🏘️</Text>
                </View>
              </View>

              <Text className="mb-3 text-center text-2xl font-bold text-gray-900">
                Nenhuma república vinculada
              </Text>

              <Text className="mb-8 text-center text-base leading-relaxed text-gray-600">
                Crie sua primeira república ou aguarde um convite para começar a
                gerenciar despesas compartilhadas.
              </Text>

              {/* Botão principal */}
              <TouchableOpacity
                onPress={handleCreateRepublic}
                className="mb-3 w-full overflow-hidden rounded-2xl bg-indigo-600 px-6 py-4 shadow-lg shadow-indigo-500/30"
                activeOpacity={0.9}
              >
                <Text className="text-center text-base font-bold text-white">
                  Criar República
                </Text>
              </TouchableOpacity>

              {/* Link secundário */}
              <TouchableOpacity
                onPress={() => router.push("/(userProfile)/invites")}
                activeOpacity={0.7}
              >
                <Text className="text-center text-sm font-medium text-indigo-600">
                  Ver meus convites
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* MENU LATERAL */}
      <SideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        user={{
          name: profile.name,
          photo: profile.photo,
          email: profile.email,
          pixKey: profile.pixKey,
          phone: profile.phone,
        }}
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
        currentPhone={profile.phone}
        onSave={handleSaveProfile}
      />
    </View>
  );
}
