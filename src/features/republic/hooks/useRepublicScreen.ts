import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useLogoutMutation } from "@/src/features/auth/hooks/useAuthMutations";
import { useResidents } from "@/src/features/residents/hooks/useResidents";
import { getErrorMessage } from "@/src/services/httpError";
import { useCurrentUserQuery } from "@/src/features/user/hooks/useUserQueries";
import { ResidentRole } from "@/src/shared/types/resident.types";
import type { TabKey } from "@/src/shared/types/tabs";
import { logger } from "@/src/shared/utils/logger";

import { showToast } from "@/src/shared/utils/showToast";
import { toastErrors } from "@/src/shared/utils/toastMessages";
import { useRepublicActions } from "./useRepublicActions";
import { useRepublicQuery, useRepublicsQuery } from "./useRepublicQueries";

export function useRepublicScreen(republicId: string) {
  const router = useRouter();
  const { data: user = null } = useCurrentUserQuery();
  const { mutateAsync: logout } = useLogoutMutation();

  const isFocused = useIsFocused();

  const { data: republics = [], refetch: refetchRepublics } = useRepublicsQuery(
    {
      enabled: Boolean(user?.perfilCompleto),
    }
  );
  const {
    data: republic = null,
    error: republicError,
    isLoading,
    isSuccess,
  } = useRepublicQuery(republicId);
  const { updateRepublic, showEditModal, setShowEditModal } =
    useRepublicActions();

  const { residents } = useResidents(republicId);

  const [tab, setTab] = useState<TabKey>("contas");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (!republicId) {
      showToast.error("ID da república não encontrado");
      router.back();
    }
  }, [republicId, router]);

  useEffect(() => {
    if (!republicId || !republicError) {
      return;
    }

    logger.warn("Republic", "Não foi possível carregar república:", {
      republicId,
    });
    showToast.error(
      getErrorMessage(republicError, "Erro ao carregar república")
    );
    router.back();
  }, [republicError, republicId, router]);

  useEffect(() => {
    if (!republicId || !isSuccess || republic !== null || !isFocused) {
      return;
    }

    showToast.error("República não encontrada");
    router.back();
  }, [isSuccess, republic, republicId, router, isFocused]);

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
      logger.error(
        "Republic",
        "Erro ao fazer logout",
        error instanceof Error ? error : undefined
      );
      toastErrors.logoutFailed(error);
    }
  }, [logout, router]);

  const handleOpenMenu = useCallback(async () => {
    if (
      user?.perfilCompleto &&
      !republics.some((item) => item.id === republicId)
    ) {
      try {
        const result = await refetchRepublics();

        if (result.error) {
          throw result.error;
        }
      } catch (error) {
        logger.warn(
          "Republic",
          "Falha ao atualizar lista de repúblicas no menu",
          {
            republicId,
            error: getErrorMessage(error, "Erro ao carregar repúblicas"),
          }
        );
      }
    }

    setIsMenuOpen(true);
  }, [refetchRepublics, republicId, republics, user?.perfilCompleto]);

  const handleSaveRepublic = useCallback(
    async (nome: string, imagem?: string) => {
      if (!republic) return;

      try {
        await updateRepublic(republic.id, {
          nome,
          imagemRepublica: imagem,
        });
      } catch (error) {
        logger.error(
          "Republic",
          "Erro ao atualizar república",
          error instanceof Error ? error : undefined
        );
        showToast.error(
          getErrorMessage(error, "Não foi possível atualizar a república.")
        );
      }
    },
    [republic, updateRepublic]
  );

  const currentResident = useMemo(() => {
    if (!user?.email) return null;
    const normalizedEmail = user.email.toLowerCase();
    return residents.find(
      (resident) => resident.email.toLowerCase() === normalizedEmail
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
    [roleLabel, user?.nome, user?.fotoPerfil, user?.email]
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
    handleOpenMenu,
    userMenu,
    currentUserRole,
    currentResidentId,
    republics,
  };
}
