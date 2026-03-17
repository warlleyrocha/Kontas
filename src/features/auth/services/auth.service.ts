import { toUserFriendlyError } from "@/src/services/httpError";
import { logger } from "@/src/shared/utils/logger";
import { api } from "../../../services/api";
import {
  AuthResponse,
  CompleteProfileRequest,
  GoogleLoginRequest,
} from "../types/auth.types";

export const authService = {
  // Método para login com Google
  googleLogin: async (token: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>("/auth/google", {
        token,
      } as GoogleLoginRequest);

      return response.data;
    } catch (error) {
      throw toUserFriendlyError(error, {
        defaultMessage: "Erro ao fazer login com Google.",
        statusMessages: {
          400: "Token inválido ou requisição malformada.",
          401: "Não foi possível autenticar com o Google.",
          500: "Erro no servidor. Tente novamente mais tarde.",
        },
      });
    }
  },

  // Completar dados do perfil
  completeProfile: async (data: CompleteProfileRequest): Promise<void> => {
    try {
      logger.debug("Auth", "Payload de completar perfil", data);

      await api.post("/auth/completar-dados", data);

      logger.info("Auth", "Perfil completado com sucesso no backend");
    } catch (error) {
      logger.error("Auth", "Erro ao completar perfil", error instanceof Error ? error : undefined);
      throw toUserFriendlyError(error, {
        defaultMessage: "Erro ao completar perfil.",
        statusMessages: {
          400: "Dados inválidos. Verifique os campos e tente novamente.",
          401: "Sessão expirada. Faça login novamente.",
          500: "Erro no servidor. Tente novamente mais tarde.",
        },
      });
    }
  },
};
