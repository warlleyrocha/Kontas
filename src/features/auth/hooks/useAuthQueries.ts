import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { deleteItemAsync, getItemAsync, setItemAsync } from "expo-secure-store";

import { authService } from "@/src/features/auth/services/auth.service";
import { userService } from "@/src/features/user/services/user.service";
import { getErrorMessage, isUnauthorizedError } from "@/src/services/httpError";
import { logger } from "@/src/shared/utils/logger";
import { showToast } from "@/src/shared/utils/showToast";

import type {
  CompleteProfileRequest,
  UpdateUserRequest,
  User,
} from "@/src/features/user/types/user.types";
import { authKeys } from "./auth.keys";

export function useAuthUserQuery() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: authKeys.user,
    queryFn: async (): Promise<User | null> => {
      const token = await getItemAsync("token");

      if (!token) {
        logger.warn("Auth", "Nenhum token encontrado");
        return null;
      }

      try {
        const user = await userService.fetchUser();
        await AsyncStorage.setItem("@app:user", JSON.stringify(user));
        logger.info("Auth", "Token válido. Usuário autenticado");
        return user;
      } catch (error) {
        if (isUnauthorizedError(error)) {
          logger.warn("Auth", "Token inválido ou expirado");
          await queryClient.cancelQueries();
          await Promise.all([
            deleteItemAsync("token"),
            AsyncStorage.removeItem("@app:user"),
          ]);
          return null;
        }

        // Falha transitória: preserva sessão com cache local
        const cachedUser = await AsyncStorage.getItem("@app:user");
        if (cachedUser) {
          const message = getErrorMessage(error, "Erro ao validar sessão");
          logger.warn("Auth", "Falha transitória ao validar sessão", {
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

export function useLoginWithGoogleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => authService.googleLogin(token),
    onSuccess: async (data) => {
      await Promise.all([
        setItemAsync("token", data.token),
        AsyncStorage.setItem("@app:user", JSON.stringify(data.user)),
      ]);
      queryClient.setQueryData(authKeys.user, data.user);
      logger.info("Auth", "Login bem-sucedido");
    },
  });
}

export function useCompleteProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CompleteProfileRequest) =>
      authService.completeProfile(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authKeys.user });
      logger.info("Auth", "Perfil completado e sincronizado");
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error, "Erro ao completar perfil");
      logger.error("Auth", "Erro ao completar perfil", new Error(errorMessage));
      showToast.error(errorMessage);
    },
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserRequest) => userService.updateUser(data),
    onSuccess: async (user) => {
      queryClient.setQueryData(authKeys.user, user);
      await AsyncStorage.setItem("@app:user", JSON.stringify(user));
      logger.info("Auth", "Usuário atualizado com sucesso");
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await queryClient.cancelQueries();
      await Promise.allSettled([
        deleteItemAsync("token"),
        AsyncStorage.multiRemove(["@app:user", "republic-data"]),
        GoogleSignin.signOut(),
      ]);
    },
    onSuccess: () => {
      queryClient.clear();
      router.replace("/(auth)/login");
      logger.info("Auth", "Logout realizado com sucesso");
    },
    onError: (error) => {
      logger.error(
        "Auth",
        "Erro ao fazer logout",
        error instanceof Error ? error : undefined,
      );
    },
  });
}
