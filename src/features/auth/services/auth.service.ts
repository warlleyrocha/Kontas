import { toUserFriendlyError } from "@/src/services/httpError";
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
      console.log("📤 Enviando dados do perfil para o backend...");

      await api.post("/auth/completar-dados", data);

      console.log("✅ Perfil completado com sucesso no backend");
    } catch (error) {
      console.error("❌ Erro ao completar perfil:", error);
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
