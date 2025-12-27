import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";

import EmptyRepublic from "@/components/CardsProfile/EmptyRepublic";
import IncompleteProfile from "@/components/CardsProfile/IncompleteProfile";
import { EditProfileModal } from "@/components/Modals/EditProfileModal";
import { MenuButton, SideMenu } from "@/components/SideMenu";
import { showToast } from "@/utils/showToast";
import { toastErrors } from "@/utils/toastMessages";

import { useSideMenu } from "@/components/SideMenu/useSideMenu";

import { useAuth } from "@/contexts";

export default function SetupProfile() {
  const router = useRouter();
  const { user, logout, completeProfile, updateUser } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  const handleSignOut = useCallback(async () => {
    try {
      await logout();
      router.replace("/");
    } catch (error) {
      console.error("❌ Erro ao fazer logout:", error);
      toastErrors.logoutFailed();
    }
  }, [logout, router]);

  const handleSaveProfile = async (
    name: string,
    pixKey?: string,
    photo?: string,
    phone?: string
  ) => {
    const isCompletingProfile = !user?.perfilCompleto;

    // Validações obrigatórias APENAS ao completar perfil pela primeira vez
    if (isCompletingProfile && (!phone || !pixKey)) {
      Alert.alert(
        "Campos Obrigatórios",
        "Por favor, preencha o telefone e a chave Pix."
      );
      return;
    }

    try {
      console.log(
        isCompletingProfile
          ? "💾 Completando perfil..."
          : "💾 Atualizando perfil..."
      );

      if (isCompletingProfile) {
        await completeProfile({
          nome: name,
          telefone: phone!,
          chavePix: pixKey!,
          fotoPerfil: photo,
        });
      } else {
        await updateUser({
          nome: name,
          telefone: phone,
          chavePix: pixKey,
          fotoPerfil: photo,
        });
      }

      console.log("✅ Perfil salvo com sucesso!");
      console.log("📊 Dados atualizados:", {
        nome: user?.nome,
        telefone: user?.telefone,
        chavePix: user?.chavePix,
      });
      setShowEditProfileModal(false);
      showToast.success(
        isCompletingProfile
          ? "Perfil salvo com sucesso!"
          : "Perfil atualizado com sucesso!"
      );
    } catch (error) {
      console.log("Erro ao salvar o perfil:", error);
      toastErrors.profileUpdateFailed();
    }
  };

  const handleCreateRepublic = () => {
    router.push("/register/republic");
  };

  const { menuItems, footerItems } = useSideMenu("profile", handleSignOut);

  // Se não tem usuário, não renderiza nada (loading do Context)
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
          onViewInvites={() => router.push("/(auth)/checkEmail")}
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
        currentPixKey={user.chavePix}
        currentPhoto={user.fotoPerfil}
        currentPhone={user.telefone}
        onSave={handleSaveProfile}
      />
    </View>
  );
}
