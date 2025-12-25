import { useAuth } from "@/contexts";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
//import AsyncStorage from "@react-native-async-storage/async-storage";

import EmptyRepublic from "@/components/CardsProfile/EmptyRepublic";
import IncompleteProfile from "@/components/CardsProfile/IncompleteProfile";
//import RepublicList from "@/components/CardsProfile/RepublicList";
import { EditProfileModal } from "@/components/Modals/EditProfileModal";
// RepublicCard from "@/components/RepublicCard";
import { MenuButton, SideMenu } from "@/components/SideMenu";
import { useSideMenu } from "@/hooks/useSideMenu";

export default function SetupProfile() {
  const { user, logout, completeProfile } = useAuth();
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  /* const handleEditRepublic = (id: string) => {
    console.log("Editar república:", id);
  };

  const handleSelectRepublic = (id: string) => {
    console.log("Selecionar república:", id);
    router.push("/home");
  };*/

  useEffect(() => {
    console.log("👤 SetupProfile - User mudou:", {
      nome: user?.nome,
      telefone: user?.telefone,
      chavePix: user?.chavePix,
      perfilCompleto: user?.perfilCompleto,
    });
  }, [user]);

  const handleSignOut = useCallback(async () => {
    try {
      await logout();
      router.replace("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      Alert.alert(
        "Erro no Logout",
        "Não foi possível fazer logout. Tente novamente."
      );
    }
  }, [logout, router]);

  const { menuItems, footerItems } = useSideMenu("profile", handleSignOut);

  // 🆕 Salvar perfil no BACKEND
  const handleSaveProfile = async (
    name: string,
    email: string,
    pixKey?: string,
    photo?: string,
    phone?: string
  ) => {
    // Validações
    if (!phone || !pixKey) {
      Alert.alert(
        "Campos Obrigatórios",
        "Por favor, preencha o telefone e a chave Pix."
      );
      return;
    }

    try {
      console.log("💾 Salvando perfil...");

      await completeProfile({
        nome: name,
        telefone: phone,
        chavePix: pixKey,
        fotoPerfil: photo,
      });

      console.log("✅ Perfil completado com sucesso!");
      console.log("📊 Dados atualizados:", {
        // 🆕 Debug
        nome: user?.nome,
        telefone: user?.telefone,
        chavePix: user?.chavePix,
      });

      Alert.alert("Sucesso!", "Seu perfil foi completado com sucesso.", [
        {
          text: "OK",
          onPress: () => {
            setShowEditProfileModal(false);
            // TODO: Quando tiver repúblicas, redirecionar ou recarregar
          },
        },
      ]);
    } catch (error) {
      // Erro já foi tratado no Context com Alert
      console.error("Erro ao salvar perfil:", error);
    }
  };

  const handleCreateRepublic = () => {
    router.push("/register/republic");
  };

  // 🆕 Se não tem usuário, não renderiza nada (loading do Context)
  if (!user) {
    return null;
  }

  return (
    <View className="flex-1 bg-[#FAFAFA]">
      {/* HEADER */}
      <View className="mt-[24px] flex-row items-center gap-3 border-b border-b-black/10 bg-[#FAFAFA] px-[16px] py-4">
        <View className="h-[50px] w-[50px] items-center justify-center overflow-hidden rounded-full bg-gray-200">
          {user.fotoPerfil ? (
            <Image
              source={{ uri: user.fotoPerfil }}
              style={{ width: 50, height: 50, borderRadius: 25 }}
              resizeMode="cover"
            />
          ) : (
            <Text className="text-xl font-bold text-gray-500">
              {user.nome.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        <TouchableOpacity
          className="flex-1"
          onPress={() => setShowEditProfileModal(true)}
        >
          <Text className="text-base font-semibold">{user.nome}</Text>
          <Text className="text-sm text-gray-500">Configurar perfil</Text>
        </TouchableOpacity>

        <MenuButton onPress={() => setIsMenuOpen(true)} />
      </View>

      {/* CONTENT */}
      {user.perfilCompleto ? (
        // 🎯 Perfil completo - mostra mensagem temporária
        <EmptyRepublic
          onCreateRepublic={handleCreateRepublic}
          onViewInvites={() => router.push("/(userProfile)/invites")}
        />
      ) : (
        // 🎯 Perfil incompleto - mostra card para completar
        <IncompleteProfile onContinue={() => setShowEditProfileModal(true)} />
      )}

      {/* MENU LATERAL */}
      {isMenuOpen && (
        <SideMenu
          key={`sidemenu-${user.chavePix}-${user.telefone}`}
          onRequestClose={() => setIsMenuOpen(false)}
          user={{
            name: user.nome,
            photo: user.fotoPerfil,
            email: user.email,
            pixKey: user.chavePix,
            phone: user.telefone,
          }}
          menuItems={menuItems}
          footerItems={footerItems}
        />
      )}

      {/* MODAL CONFIGURAR PERFIL */}
      <EditProfileModal
        key={`editmodal-${user.chavePix}-${user.telefone}`}
        visible={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        currentName={user.nome}
        currentEmail={user.email}
        currentPixKey={user.chavePix}
        currentPhoto={user.fotoPerfil}
        currentPhone={user.telefone}
        onSave={handleSaveProfile}
      />
    </View>
  );
}
