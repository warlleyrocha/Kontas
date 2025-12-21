import {
  PROFILE_COMPLETE_STORAGE_KEY,
  REPUBLIC_STORAGE_KEY,
  USER_PROFILE_STORAGE_KEY,
} from "@/constants/storageKeys";
import { useAsyncStorage } from "@/hooks/useAsyncStorage";
import { useSideMenu } from "@/hooks/useSideMenu";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";

import EmptyRepublic from "@/components/CardsProfile/EmptyRepublic";
import IncompleteProfile from "@/components/CardsProfile/IncompleteProfile";
import RepublicList from "@/components/CardsProfile/RepublicList";
import { EditProfileModal } from "@/components/Modals/EditProfileModal";
import RepublicCard from "@/components/RepublicCard";
import { MenuButton, SideMenu } from "@/components/SideMenu";

import { useAuth } from "@/contexts";

/* 
Mock de repúblicas cadastradas
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
*/
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

  // Estado para repúblicas do usuário
  const [republicas, setRepublicas] = useState<any[]>([]);

  // Carrega república salva no AsyncStorage ao montar
  useEffect(() => {
    const loadRepublica = async () => {
      try {
        const republicaStr = await AsyncStorage.getItem(REPUBLIC_STORAGE_KEY);
        console.log("Dados da república recuperados:", republicaStr);
        if (republicaStr) {
          const republica = JSON.parse(republicaStr);
          // Adapta para o formato esperado pela RepublicList
          setRepublicas([
            {
              id: republica.id,
              nome: republica.nome,
              imagem: republica.imagemRepublica,
              moradores: republica.moradores?.length || 0,
            },
          ]);
        } else {
          setRepublicas([]);
        }
      } catch (e) {
        console.error("Erro ao carregar república:", e);
        setRepublicas([]);
      }
    };
    loadRepublica();
  }, []);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  // Estado local para dados do perfil usando hook genérico
  const { data: profile, setData: setProfile } = useAsyncStorage<ProfileData>(
    USER_PROFILE_STORAGE_KEY,
    {
      name: user?.user.name ?? "",
      email: user?.user.email ?? "",
      pixKey: "",
      photo: user?.user.photo ?? undefined,
      phone: "",
    }
  );

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

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      router.replace("/");
    } catch (error) {
      console.error("Erro ao fazer logout da conta:", error);
      Alert.alert(
        "Erro no Logout",
        "Não foi possível fazer logout da conta. Tente novamente."
      );
    }
  }, [signOut, router]);

  const { menuItems, footerItems } = useSideMenu("profile", handleSignOut);

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

        <MenuButton onPress={() => setIsMenuOpen(true)} />
      </View>

      {/* CONTENT */}
      {(() => {
        // 1. PERFIL INCOMPLETO - Mostra card de completar perfil
        if (!profileComplete) {
          return (
            <IncompleteProfile
              onContinue={() => setShowEditProfileModal(true)}
            />
          );
        }

        // 2. PERFIL COMPLETO + TEM REPÚBLICAS - Mostra lista
        if (republicas.length > 0) {
          return (
            <RepublicList
              republicas={republicas}
              onEditRepublic={handleEditRepublic}
              onSelectRepublic={handleSelectRepublic}
              onCreateRepublic={handleCreateRepublic}
              RepublicCard={RepublicCard}
            />
          );
        }

        // 3. PERFIL COMPLETO + SEM REPÚBLICAS - Mostra card vazio
        return (
          <EmptyRepublic
            onCreateRepublic={handleCreateRepublic}
            onViewInvites={() => router.push("/(userProfile)/invites")}
          />
        );
      })()}

      {/* MENU LATERAL */}
      {isMenuOpen && (
        <SideMenu
          onRequestClose={() => setIsMenuOpen(false)}
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
      )}

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
