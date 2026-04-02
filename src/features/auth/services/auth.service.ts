import { toUserFriendlyError } from "@/src/services/httpError";
import { api } from "../../../services/api";
import { AuthResponse, GoogleLoginRequest } from "../types/auth.types";

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
};
