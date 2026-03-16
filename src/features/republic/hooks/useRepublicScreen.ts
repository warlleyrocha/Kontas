import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";

import { useAuth } from "@/src/features/auth/contexts";
import { useResidents } from "@/src/features/residents/hooks/useResidents";
import { useRepublicList } from "./useRepublicList";
import { useRepublicActions } from "./useRepublicActions";
import { useRefresh } from "@/src/shared/contexts/RefreshContext";

import type { RepublicResponse } from "@/src/features/republic/types/republic.types";
import type { TabKey } from "@/src/shared/types/tabs";

import { showToast } from "@/src/shared/utils/showToast";
import { toastErrors } from "@/src/shared/utils/toastMessages";
import { getErrorMessage } from "@/src/services/httpError";
import { ResidentRole } from "@/src/shared/types/resident.types";

export function useRepublicScreen(republicId: string) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const { republics, fetchRepublics, fetchRepublicById } = useRepublicList();
  const { updateRepublic, showEditModal, setShowEditModal } =
    useRepublicActions();

  const { residents, fetchResidents } = useResidents();
  const { registerRefresh } = useRefresh();

  const [republic, setRepublic] = useState<RepublicResponse | null>(null);
  const [tab, setTab] = useState<TabKey>("contas");
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  // 🔹 Carregar República
  useEffect(() => {
    async function loadRepublic() {
      if (!republicId) {
        showToast.error("ID da república não encontrado");
        router.back();
        return;
      }

      setIsLoading(true);
      try {
        const data = await fetchRepublicById(republicId);

        if (!data) {
          showToast.error("República não encontrada");
          router.back();
          return;
        }

        setRepublic(data);
      } catch (error) {
        console.warn("Não foi possível carregar república:", error);
        showToast.error(getErrorMessage(error, "Erro ao carregar república"));
        router.back();
      } finally {
        setIsLoading(false);
      }
    }

    loadRepublic();
  }, [republicId, fetchRepublicById, router]);

  useEffect(() => {
    if (!user?.perfilCompleto) return;
    void fetchRepublics();
  }, [fetchRepublics, user?.perfilCompleto]);

  // 🔹 Carregar moradores
  useEffect(() => {
    if (republic?.id) {
      fetchResidents(republic.id);
    }
  }, [republic?.id, fetchResidents]);

  // 🔹 Registrar refresh global (república + moradores)
  const fetchData = useCallback(async () => {
    const data = await fetchRepublicById(republicId);
    if (data) {
      setRepublic(data);
      await fetchResidents(data.id);
    }
  }, [republicId, fetchRepublicById, fetchResidents]);

  useEffect(() => {
    return registerRefresh(`republic-${republicId}`, fetchData);
  }, [registerRefresh, republicId, fetchData]);

  // Obtém numero de moradores
  const residentsCount = residents.length;

  const toggleFavorite = useCallback(() => {
    setIsFavorited((prev) => {
      showToast.success(
        prev
          ? "República removida dos favoritos"
          : "República adicionada aos favoritos",
      );
      return !prev;
    });
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await logout();
      router.replace("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toastErrors.logoutFailed(error);
    }
  }, [logout, router]);

  const handleSaveRepublic = useCallback(
    async (nome: string, imagem?: string) => {
      if (!republic) return;

      await updateRepublic(republic.id, {
        nome,
        imagemRepublica: imagem,
      });

      setRepublic((prev) =>
        prev ? { ...prev, nome, imagemRepublica: imagem } : null,
      );
    },
    [republic, updateRepublic],
  );

  const currentResident = useMemo(() => {
    if (!user?.email) return null;
    const normalizedEmail = user.email.toLowerCase();
    return residents.find(
      (resident) => resident.email.toLowerCase() === normalizedEmail,
    );
  }, [residents, user?.email]);

  const currentUserRole = currentResident?.role ?? null;
  const currentResidentId = currentResident?.id ?? null;
  let roleLabel: string | null = null;

  if (currentUserRole === ResidentRole.ADMIN) {
    roleLabel = "Admin";
  } else if (currentUserRole === ResidentRole.USER) {
    roleLabel = "Morador";
  }

  const userMenu = useMemo(
    () => ({
      name: user?.nome ?? "Usuário",
      photo: user?.fotoPerfil,
      email: user?.email,
      roleLabel,
    }),
    [roleLabel, user?.nome, user?.fotoPerfil, user?.email],
  );

  return {
    republic,
    residents,
    residentsCount,
    tab,
    setTab,
    isLoading,
    isMenuOpen,
    setIsMenuOpen,
    isFavorited,
    toggleFavorite,
    showEditModal,
    setShowEditModal,
    handleSaveRepublic,
    handleSignOut,
    userMenu,
    currentUserRole,
    currentResidentId,
    republics,
  };
}
