import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { deleteItemAsync, setItemAsync } from "expo-secure-store";

import { authService } from "@/src/features/auth/services/auth.service";
import { userKeys } from "@/src/features/user/hooks/user.keys";
import {
  AUTH_TOKEN_STORAGE_KEY,
  clearAuthorizationHeader,
  setAuthorizationHeader,
} from "@/src/services/authHeader";
import { logger } from "@/src/shared/utils/logger";

const APP_USER_STORAGE_KEY = "@app:user";

export function useLoginWithGoogleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => authService.googleLogin(token),
    onSuccess: async (data) => {
      await Promise.all([
        setItemAsync(AUTH_TOKEN_STORAGE_KEY, data.token),
        AsyncStorage.setItem(APP_USER_STORAGE_KEY, JSON.stringify(data.user)),
      ]);
      setAuthorizationHeader(data.token);
      queryClient.setQueryData(userKeys.current(), data.user);
      logger.info("Auth", "Login bem-sucedido");
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      clearAuthorizationHeader();
      await queryClient.cancelQueries();
      await Promise.allSettled([
        deleteItemAsync(AUTH_TOKEN_STORAGE_KEY),
        AsyncStorage.multiRemove([APP_USER_STORAGE_KEY, "republic-data"]),
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
