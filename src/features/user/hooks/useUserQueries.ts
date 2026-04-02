import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteItemAsync } from "expo-secure-store";

import {
  AUTH_TOKEN_STORAGE_KEY,
  clearAuthorizationHeader,
  hasAuthorizationHeader,
  hydrateAuthorizationHeader,
} from "@/src/services/authHeader";
import { getErrorMessage, isUnauthorizedError } from "@/src/services/httpError";
import { logger } from "@/src/shared/utils/logger";
import { showToast } from "@/src/shared/utils/showToast";

import { userService } from "../services/user.service";
import type {
  CompleteProfileRequest,
  UpdateUserRequest,
  User,
} from "../types/user.types";
import { userKeys } from "./user.keys";

const APP_USER_STORAGE_KEY = "@app:user";

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
        await AsyncStorage.setItem(APP_USER_STORAGE_KEY, JSON.stringify(user));
        logger.info("User", "Usuário autenticado e sincronizado");
        return user;
      } catch (error) {
        if (isUnauthorizedError(error)) {
          logger.warn("User", "Token inválido ou expirado");
          clearAuthorizationHeader();
          await queryClient.cancelQueries();
          await Promise.all([
            deleteItemAsync(AUTH_TOKEN_STORAGE_KEY),
            AsyncStorage.removeItem(APP_USER_STORAGE_KEY),
          ]);
          return null;
        }

        const cachedUser = await AsyncStorage.getItem(APP_USER_STORAGE_KEY);
        if (cachedUser) {
          const message = getErrorMessage(error, "Erro ao validar sessão");
          logger.warn("User", "Falha transitória ao validar sessão", {
            message,
          });
          return JSON.parse(cachedUser) as User;
        }

        throw error;
      }
    },
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
      await AsyncStorage.setItem(APP_USER_STORAGE_KEY, JSON.stringify(user));
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
