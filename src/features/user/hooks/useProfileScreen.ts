import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "@/src/features/auth/contexts";
import { useRepublicList } from "@/src/features/republic/hooks/useRepublicList";
import { useRepublicActions } from "@/src/features/republic/hooks/useRepublicActions";
import { useRepublicResidents } from "@/src/shared/hooks/useRepublicResidents";
import { useRefresh } from "@/src/shared/contexts/RefreshContext";
import { useInvitesContext } from "@/src/features/invites/contexts/InvitesContext";

import { useSideMenu } from "@/src/shared/components/SideMenu/useSideMenu";

import { maskPhone } from "@/src/shared/utils/inputMasks";
import { showToast } from "@/src/shared/utils/showToast";
import { toastErrors } from "@/src/shared/utils/toastMessages";
import type { RepublicResponse } from "@/src/features/republic/types/republic.types";

interface CardPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function useProfileScreen() {
  const router = useRouter();

  const { user, logout, completeProfile, updateUser } = useAuth();
  const { republics, fetchRepublics } = useRepublicList();
  const { deleteRepublic, updateRepublic, showEditModal, setShowEditModal } = useRepublicActions();
  const { isAdmin } = useRepublicResidents(republics, user?.email);

  const { refreshing, onRefresh, registerRefresh } = useRefresh();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<CardPosition | null>(null);
  const [selectedRepublic, setSelectedRepublic] = useState<RepublicResponse | null>(null);

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
          "Por favor, preencha o telefone e a chave Pix.",
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
            : "Perfil atualizado com sucesso!",
        );
      } catch (error) {
        console.log("Erro ao salvar o perfil:", error);
        toastErrors.profileUpdateFailed(error);
      }
    },
    [user, completeProfile, updateUser],
  );

  const handleCreateRepublic = useCallback(() => {
    router.push("/register/republic");
  }, [router]);

  const handleViewInvites = useCallback(() => {
    router.push("/(userProfile)/invites");
  }, [router]);

  const handleSelectRepublic = useCallback(
    (id: string) => {
      router.push(`/(republics)/${id}`);
    },
    [router],
  );

  const handleLongPressRepublic = useCallback(
    (republic: RepublicResponse, position: CardPosition) => {
      setSelectedRepublic(republic);
      setContextMenuPosition(position);
      setContextMenuVisible(true);
    },
    [],
  );

  const handleCloseContextMenu = useCallback(() => {
    setContextMenuVisible(false);
  }, []);

  const handleOpenEditFromMenu = useCallback(() => {
    setContextMenuVisible(false);
    setShowEditModal(true);
  }, [setShowEditModal]);

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
    setSelectedRepublic(null);
  }, [setShowEditModal]);

  const handleSaveRepublicEdit = useCallback(
    async (name: string, image?: string) => {
      if (!selectedRepublic) return;
      await updateRepublic(selectedRepublic.id, { nome: name, imagemRepublica: image });
      handleCloseEditModal();
      fetchRepublics();
    },
    [selectedRepublic, updateRepublic, handleCloseEditModal, fetchRepublics],
  );

  const handleDeleteFromMenu = useCallback(() => {
    setContextMenuVisible(false);
    if (!selectedRepublic) return;
    const republicName = selectedRepublic.nome;
    const republicId = selectedRepublic.id;
    showToast.confirm(`Excluir "${republicName}"?`, () => {
      deleteRepublic(republicId).then(() => {
        setSelectedRepublic(null);
        fetchRepublics();
      });
    });
  }, [selectedRepublic, deleteRepublic, fetchRepublics]);

  useEffect(() => {
    if (!user?.perfilCompleto) return;
    fetchRepublics();
  }, [user?.perfilCompleto, fetchRepublics]);

  useEffect(() => {
    return registerRefresh("profile", fetchRepublics);
  }, [registerRefresh, fetchRepublics]);

  const { pendingCount } = useInvitesContext();

  const { menuItems, footerItems } = useSideMenu("profile", handleSignOut, { pendingInvitesCount: pendingCount });

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
    showEditRepublicModal: showEditModal,
    refreshing,

    // context menu
    contextMenuVisible,
    contextMenuPosition,
    selectedRepublic,

    // actions
    handleSaveProfile,
    handleCreateRepublic,
    handleViewInvites,
    handleSelectRepublic,
    handleLongPressRepublic,
    handleCloseContextMenu,
    handleOpenEditFromMenu,
    handleCloseEditModal,
    handleSaveRepublicEdit,
    handleDeleteFromMenu,
    isAdmin,
    onRefresh,

    // side menu
    menuItems,
    footerItems,
    sideMenuUser,
  };
}
