import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

import { useLogoutMutation } from "@/src/features/auth/hooks/useAuthMutations";
import {
  usePendingInvitesCount,
  useSendInviteMutation,
} from "@/src/features/invites/hooks/useInvitesQueries";
import { useRepublicActions } from "@/src/features/republic/hooks/useRepublicActions";
import { useRepublicsQuery } from "@/src/features/republic/hooks/useRepublicQueries";
import type { RepublicResponse } from "@/src/features/republic/types/republic.types";
import { getErrorMessage } from "@/src/services/httpError";
import {
  useCompleteProfileMutation,
  useCurrentUserQuery,
  useUpdateCurrentUserMutation,
} from "@/src/features/user/hooks/useUserQueries";
import { useSideMenu } from "@/src/shared/components/SideMenu/useSideMenu";
import { useRepublicResidents } from "@/src/shared/hooks/useRepublicResidents";
import { maskPhone } from "@/src/shared/utils/inputMasks";
import { logger } from "@/src/shared/utils/logger";
import { showToast } from "@/src/shared/utils/showToast";
import { toastErrors } from "@/src/shared/utils/toastMessages";

interface CardPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function useProfileScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();

  const { data: user = null } = useCurrentUserQuery();
  const { mutateAsync: logout } = useLogoutMutation();
  const { mutateAsync: completeProfile } = useCompleteProfileMutation();
  const { mutateAsync: updateCurrentUser } = useUpdateCurrentUserMutation();
  const {
    data: republics = [],
    error: republicsError,
    refetch: refetchRepublics,
  } = useRepublicsQuery({
    enabled: Boolean(user?.perfilCompleto),
  });
  const { deleteRepublic, updateRepublic, showEditModal, setShowEditModal } =
    useRepublicActions();
  const { getResidentsCount, isAdmin } = useRepublicResidents(
    republics,
    user?.email,
    isFocused,
  );
  const pendingCount = usePendingInvitesCount();
  const {
    mutateAsync: sendInvite,
    isPending: sendLoading,
    error: sendErrorRaw,
  } = useSendInviteMutation();
  const sendError = sendErrorRaw
    ? getErrorMessage(sendErrorRaw, "Erro ao enviar convite.")
    : null;

  const [refreshing, setRefreshing] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] =
    useState<CardPosition | null>(null);
  const [selectedRepublic, setSelectedRepublic] =
    useState<RepublicResponse | null>(null);

  const handleSignOut = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      logger.error(
        "User",
        "Erro ao fazer logout",
        error instanceof Error ? error : undefined,
      );
      toastErrors.logoutFailed(error);
    }
  }, [logout]);

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
          await updateCurrentUser({
            nome: name,
            telefone: phone,
            chavePix: pixKey,
            fotoPerfil: photo,
          });
        }

        setShowEditProfileModal(false);
      } catch (error) {
        logger.error(
          "User",
          "Erro ao salvar perfil",
          error instanceof Error ? error : undefined,
        );
      }
    },
    [user, completeProfile, updateCurrentUser],
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
      try {
        await updateRepublic(selectedRepublic.id, {
          nome: name,
          imagemRepublica: image,
        });
        handleCloseEditModal();
      } catch (error) {
        logger.error(
          "Republic",
          "Erro ao atualizar república",
          error instanceof Error ? error : undefined,
        );
        showToast.error(
          getErrorMessage(error, "Não foi possível atualizar a república."),
        );
      }
    },
    [selectedRepublic, updateRepublic, handleCloseEditModal],
  );

  const handleDeleteFromMenu = useCallback(() => {
    setContextMenuVisible(false);
    if (!selectedRepublic) return;
    const republicName = selectedRepublic.nome;
    const republicId = selectedRepublic.id;
    showToast.confirm(`Excluir "${republicName}"?`, async () => {
      try {
        await deleteRepublic(republicId);
        setSelectedRepublic(null);
      } catch (error) {
        logger.error(
          "Republic",
          "Erro ao excluir república",
          error instanceof Error ? error : undefined,
        );
        showToast.error(
          getErrorMessage(error, "Não foi possível excluir a república."),
        );
      }
    });
  }, [selectedRepublic, deleteRepublic]);

  const [showInviteModal, setShowInviteModal] = useState(false);

  const handleInviteFromMenu = useCallback(() => {
    setContextMenuVisible(false);
    setShowInviteModal(true);
  }, []);

  const handleCloseInviteModal = useCallback(() => {
    setShowInviteModal(false);
  }, []);

  useEffect(() => {
    if (!republicsError) {
      return;
    }

    showToast.error(
      getErrorMessage(
        republicsError,
        "Não foi possível carregar as repúblicas.",
      ),
    );
  }, [republicsError]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchRepublics();
    } finally {
      setRefreshing(false);
    }
  }, [refetchRepublics]);

  const { menuItems, footerItems } = useSideMenu("profile", handleSignOut, {
    republics,
    pendingInvitesCount: pendingCount,
  });

  const sideMenuUser = useMemo(() => {
    if (!user) return null;
    return {
      name: user.nome ?? "",
      photo: user.fotoPerfil ?? null,
      email: user.email,
      pixKey: user.chavePix,
      phone: maskPhone(user.telefone ?? ""),
    };
  }, [user]);

  return {
    user,
    republics,
    getResidentsCount,

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
    showInviteModal,
    handleInviteFromMenu,
    handleCloseInviteModal,
    isAdmin,
    onRefresh,

    // side menu
    menuItems,
    footerItems,
    sideMenuUser,
    sendInvite,
    sendLoading,
    sendError,
  };
}
