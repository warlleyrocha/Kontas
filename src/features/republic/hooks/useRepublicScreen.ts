import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";

import { useAuth } from "@/src/features/auth/contexts";
import { useResidents } from "@/src/features/residents/hooks/useResidents";
import { useRepublicList } from "./useRepublicList";
import { useRepublicActions } from "./useRepublicActions";

import type { RepublicResponse } from "@/src/features/republic/types/republic.types";
import type { TabKey } from "@/src/types/tabs";

import { showToast } from "@/src/utils/showToast";
import { toastErrors } from "@/src/utils/toastMessages";
import { getErrorMessage } from "@/src/services/httpError";

export function useRepublicScreen(republicId: string) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const { fetchRepublicById } = useRepublicList();
  const { updateRepublic, showEditModal, setShowEditModal } =
    useRepublicActions();

  const { residents, fetchResidents } = useResidents();

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

  // 🔹 Carregar moradores
  useEffect(() => {
    if (republic?.id) {
      fetchResidents(republic.id);
    }
  }, [republic?.id, fetchResidents]);

  // Obtém numero de moradores
  const residentsCount = residents.length;

  const toggleFavorite = useCallback(() => {
    setIsFavorited((prev) => {
      showToast.success(
        prev
          ? "República removida dos favoritos"
          : "República adicionada aos favoritos"
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
        prev ? { ...prev, nome, imagemRepublica: imagem } : null
      );
    },
    [republic, updateRepublic]
  );

  const userMenu = useMemo(
    () => ({
      name: user?.nome ?? "Usuário",
      photo: user?.fotoPerfil,
      email: user?.email,
    }),
    [user?.nome, user?.fotoPerfil, user?.email]
  );

  const currentUserRole = useMemo(() => {
    if (!user?.email) return null;
    const normalizedEmail = user.email.toLowerCase();
    const currentUser = residents.find(
      (resident) => resident.email.toLowerCase() === normalizedEmail
    );
    return currentUser?.role ?? null;
  }, [residents, user?.email]);

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
  };
}
