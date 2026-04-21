import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { deleteItemAsync, setItemAsync } from "expo-secure-store";

import { authService } from "@/src/features/auth/services/auth.service";
import { userKeys } from "@/src/features/user/hooks/user.keys";
import {
  clearAuthorizationHeader,
  setAuthorizationHeader,
} from "@/src/services/authHeader";
import {
  APP_USER_STORAGE_KEY,
  AUTH_TOKEN_STORAGE_KEY,
  REPUBLIC_DATA_STORAGE_KEY,
} from "@/src/services/storageKeys";
import { logger } from "@/src/shared/utils/logger";

export function useLoginWithGoogleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => authService.googleLogin(token),
    onSuccess: async (data) => {
      // Token: crítico — deve ser persistido antes de continuar
      await setItemAsync(AUTH_TOKEN_STORAGE_KEY, data.token);
      setAuthorizationHeader(data.token);
      queryClient.setQueryData(userKeys.current(), data.user);
      queryClient.setQueryData(userKeys.cached(), data.user);

      // User cache: fire-and-forget — serve só como persistência auxiliar.
      // O estado autenticado em runtime deve vir da sessão validada pelo
      // useCurrentUserQuery.
      setItemAsync(APP_USER_STORAGE_KEY, JSON.stringify(data.user)).catch(
        (err) =>
          logger.error(
            "Auth",
            "Falha ao persistir user no SecureStore após login",
            err instanceof Error ? err : undefined
          )
      );

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

      // Deletes devem ser bloqueantes: se falharem, dados do usuário
      // anterior podem persistir e hidratar incorretamente no próximo boot.
      await deleteItemAsync(AUTH_TOKEN_STORAGE_KEY);
      await deleteItemAsync(APP_USER_STORAGE_KEY);
      await deleteItemAsync(REPUBLIC_DATA_STORAGE_KEY);
      await GoogleSignin.signOut();
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
        error instanceof Error ? error : undefined
      );
    },
  });
}
