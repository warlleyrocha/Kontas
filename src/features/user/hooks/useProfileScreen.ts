import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "@/src/features/auth/contexts";
import { useRepublicList } from "@/src/features/republic/hooks/useRepublicList";
import { useRefresh } from "@/src/shared/contexts/RefreshContext";

import { useSideMenu } from "@/src/components/SideMenu/useSideMenu";

import { maskPhone } from "@/src/utils/inputMasks";
import { showToast } from "@/src/utils/showToast";
import { toastErrors } from "@/src/utils/toastMessages";

export function useProfileScreen() {
  const router = useRouter();

  const { user, logout, completeProfile, updateUser } = useAuth();
  const { republics, fetchRepublics } = useRepublicList();

  const { refreshing, onRefresh, registerRefresh } = useRefresh();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  const handleSignOut = useCallback(async () => {
    try {
      await logout();
      router.replace("/");
    } catch (error) {
      console.error("❌ Erro ao fazer logout:", error);
      toastErrors.logoutFailed(error);
    }
  }, [logout, router]);

  const handleSaveProfile = useCallback(
    async (name: string, pixKey?: string, photo?: string, phone?: string) => {
      if (!user) return;

      const isCompletingProfile = !user.perfilCompleto;

      if (isCompletingProfile && (!phone || !pixKey)) {
        Alert.alert(
          "Campos Obrigatórios",
          "Por favor, preencha o telefone e a chave Pix."
        );
        return;
      }

      try {
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

        setShowEditProfileModal(false);
        showToast.success(
          isCompletingProfile
            ? "Perfil salvo com sucesso!"
            : "Perfil atualizado com sucesso!"
        );
      } catch (error) {
        console.log("Erro ao salvar o perfil:", error);
        toastErrors.profileUpdateFailed(error);
      }
    },
    [user, completeProfile, updateUser]
  );

  const handleCreateRepublic = useCallback(() => {
    router.push("/register/republic");
  }, [router]);

  const handleViewInvites = useCallback(() => {
    router.push("/(userProfile)/invites");
  }, [router]);

  const handleEditRepublic = useCallback(
    (id: string) => {
      router.push("/"); // ajuste depois
    },
    [router]
  );

  const handleSelectRepublic = useCallback(
    (id: string) => {
      router.push(`/(republics)/${id}`);
    },
    [router]
  );

  useEffect(() => {
    if (!user?.perfilCompleto) return;
    fetchRepublics();
  }, [user?.perfilCompleto, fetchRepublics]);

  useEffect(() => {
    return registerRefresh("profile", fetchRepublics);
  }, [registerRefresh, fetchRepublics]);

  const { menuItems, footerItems } = useSideMenu("profile", handleSignOut);

  const sideMenuUser = useMemo(() => {
    if (!user) return null;
    return {
      name: user.nome,
      photo: user.fotoPerfil,
      email: user.email,
      pixKey: user.chavePix,
      phone: maskPhone(user.telefone ?? ""),
    };
  }, [user]);

  return {
    user,
    republics,

    // UI state
    isMenuOpen,
    setIsMenuOpen,
    showEditProfileModal,
    setShowEditProfileModal,
    refreshing,

    // actions
    handleSaveProfile,
    handleCreateRepublic,
    handleViewInvites,
    handleEditRepublic,
    handleSelectRepublic,
    onRefresh,

    // side menu
    menuItems,
    footerItems,
    sideMenuUser,
  };
}
