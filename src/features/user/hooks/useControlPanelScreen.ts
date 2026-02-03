import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

import { useAuth } from "@/src/features/auth/contexts";
import { useInvites } from "@/src/features/invites/hooks/useInvite";
import { useRepublicList } from "../../republic/hooks/useRepublicList";
import { useRepublicActions } from "../../republic/hooks/useRepublicActions";
import { useRepublicResidents } from "@/src/hooks/useRepublicResidents";
import type { RepublicResponse } from "@/src/features/republic/types/republic.types";
import { showToast } from "@/src/utils/showToast";

export function useControlPanelScreen() {
  const { user, loading } = useAuth();

  const { republics, fetchRepublics } = useRepublicList();
  const { deleteRepublic, updateRepublic, showEditModal, setShowEditModal } =
    useRepublicActions();

  const { getResidentsCount, isAdmin } = useRepublicResidents(
    republics,
    user?.email
  );
  const {
    sendInvite,
    loading: inviteLoading,
    error: inviteError,
  } = useInvites();

  const [inviteRepublicId, setInviteRepublicId] = useState<string | undefined>(
    undefined
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRepublic, setSelectedRepublic] =
    useState<RepublicResponse | null>(null);

  useEffect(() => {
    fetchRepublics();
  }, [fetchRepublics]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRepublics();
    setRefreshing(false);
  }, [fetchRepublics]);

  const handleDeleteRepublic = useCallback(
    async (republicId: string) => {
      if (!deleteRepublic) {
        showToast.error("Função de exclusão não disponível");
        return;
      }

      Alert.alert(
        "Confirmar exclusão",
        "Tem certeza que deseja excluir esta república?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Excluir",
            style: "destructive",
            onPress: async () => {
              await deleteRepublic(republicId);
            },
          },
        ]
      );
    },
    [deleteRepublic]
  );

  const handleEditRepublic = useCallback(
    (republic: RepublicResponse) => {
      setSelectedRepublic(republic);
      setShowEditModal(true);
    },
    [setShowEditModal]
  );

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
    setSelectedRepublic(null);
  }, [setShowEditModal]);

  const handleSaveEdit = useCallback(
    async (name: string, image?: string) => {
      if (!selectedRepublic) return;

      await updateRepublic(selectedRepublic.id, {
        nome: name,
        imagemRepublica: image,
      });

      handleCloseEditModal();
    },
    [selectedRepublic, updateRepublic, handleCloseEditModal]
  );

  const handleOpenInviteModal = useCallback((republicId: string) => {
    setInviteRepublicId(republicId);
    setModalOpen(true);
  }, []);

  const handleCloseInviteModal = useCallback(() => {
    setModalOpen(false);
    setInviteRepublicId(undefined);
  }, []);

  return {
    user,
    loading,
    republics,
    getResidentsCount,
    isAdmin,
    refreshing,
    showEditModal,
    selectedRepublic,
    modalOpen,
    inviteRepublicId,
    inviteLoading,
    inviteError,
    sendInvite,
    onRefresh,
    handleOpenInviteModal,
    handleDeleteRepublic,
    handleEditRepublic,
    handleCloseEditModal,
    handleSaveEdit,
    handleCloseInviteModal,
  };
}
