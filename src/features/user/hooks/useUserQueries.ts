import { deleteItemAsync, getItemAsync, setItemAsync } from "expo-secure-store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  clearAuthorizationHeader,
  hasAuthorizationHeader,
  hydrateAuthorizationHeader,
} from "@/src/services/authHeader";
import { getErrorMessage, isUnauthorizedError } from "@/src/services/httpError";
import {
  AUTH_TOKEN_STORAGE_KEY,
  APP_USER_STORAGE_KEY,
} from "@/src/services/storageKeys";
import { logger } from "@/src/shared/utils/logger";
import { showToast } from "@/src/shared/utils/showToast";

import { userService } from "../services/user.service";
import type {
  CompleteProfileRequest,
  UpdateUserRequest,
  User,
} from "../types/user.types";
import { userKeys } from "./user.keys";

function persistUserSecureStore(user: User): void {
  // Fire-and-forget: o SecureStore é fallback de persistência entre sessões.
  // O estado autenticado em runtime deve vir da sessão validada pelo servidor;
  // esse cache só evita perder os dados já sincronizados entre aberturas do app.
  setItemAsync(APP_USER_STORAGE_KEY, JSON.stringify(user)).catch((err) =>
    logger.error(
      "User",
      "Falha ao persistir user no SecureStore",
      err instanceof Error ? err : undefined
    )
  );
}

async function readCachedUserSecureStore(): Promise<User | null> {
  const cachedUser = await getItemAsync(APP_USER_STORAGE_KEY);
  if (!cachedUser) {
    return null;
  }

  try {
    return JSON.parse(cachedUser) as User;
  } catch {
    await deleteItemAsync(APP_USER_STORAGE_KEY);
    return null;
  }
}

export function useCurrentUserQuery() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: userKeys.current(),
    queryFn: async (): Promise<User | null> => {
      await hydrateAuthorizationHeader();

      if (!hasAuthorizationHeader()) {
        logger.warn("User", "Nenhum token encontrado");
        return null;
      }

      try {
        const user = await userService.fetchUser();
        persistUserSecureStore(user);
        queryClient.setQueryData(userKeys.cached(), user);
        logger.info("User", "Usuário autenticado e sincronizado");
        return user;
      } catch (error) {
        if (isUnauthorizedError(error)) {
          logger.warn("User", "Token inválido ou expirado");
          clearAuthorizationHeader();
          await queryClient.cancelQueries();
          await Promise.all([
            deleteItemAsync(AUTH_TOKEN_STORAGE_KEY),
            deleteItemAsync(APP_USER_STORAGE_KEY),
          ]);
          queryClient.setQueryData(userKeys.cached(), null);
          return null;
        }

        const message = getErrorMessage(error, "Erro ao validar sessão");
        logger.warn("User", "Falha transitória ao validar sessão", {
          message,
        });
        throw error;
      }
    },
    staleTime: 0,
    refetchOnMount: "always",
    retry: false,
  });
}

export function useCachedUserQuery() {
  return useQuery({
    queryKey: userKeys.cached(),
    queryFn: readCachedUserSecureStore,
    staleTime: Infinity,
    retry: false,
  });
}

export function useCompleteProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CompleteProfileRequest) =>
      userService.completeProfile(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userKeys.cached() });
      await queryClient.invalidateQueries({ queryKey: userKeys.current() });
      showToast.success("Perfil salvo com sucesso!");
      logger.info("User", "Perfil completado e sincronizado");
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Erro ao completar perfil");
      logger.error("User", "Erro ao completar perfil", new Error(message));
      showToast.error(message);
    },
  });
}

export function useUpdateCurrentUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserRequest) => userService.updateUser(data),
    onSuccess: async (user) => {
      queryClient.setQueryData(userKeys.current(), user);
      queryClient.setQueryData(userKeys.cached(), user);
      persistUserSecureStore(user);
      showToast.success("Perfil atualizado com sucesso!");
      logger.info("User", "Usuário atualizado com sucesso");
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Erro ao atualizar o perfil");
      logger.error("User", "Erro ao atualizar perfil", new Error(message));
      showToast.error(message);
    },
  });
}
