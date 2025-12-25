import { AxiosError } from "axios";
import {
  AuthResponse,
  CompleteProfileRequest,
  CompleteProfileResponse,
  GoogleLoginRequest,
  User,
} from "../types/auth.types";
import { api } from "./api";

export const authService = {
  // Método para login com Google
  googleLogin: async (token: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>("/auth/google", {
        token,
      } as GoogleLoginRequest);

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        switch (error.response?.status) {
          case 400:
            throw new Error("Token inválido ou requisição malformada");
          case 401:
            throw new Error("Não foi possível autenticar com o Google");
          case 500:
            throw new Error("Erro no servidor. Tente novamente mais tarde");
          default:
            throw new Error(error.message || "Erro ao fazer login com Google");
        }
      }
      throw error;
    }
  },

  // Método para validar e buscar dados atualizados
  me: async (): Promise<User> => {
    try {
      const response = await api.get<User>("/auth/me");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        switch (error.response?.status) {
          case 401:
            throw new Error("Sessão expirada");
          case 500:
            throw new Error("Erro no servidor");
          default:
            throw new Error("Erro ao buscar dados do usuário");
        }
      }
      throw error;
    }
  },

  // Completar dados do perfil
  completeProfile: async (
    data: CompleteProfileRequest
  ): Promise<CompleteProfileResponse> => {
    try {
      console.log("📝 Completando dados do perfil...");

      const response = await api.post<CompleteProfileResponse>(
        "/auth/completar-dados",
        data
      );

      console.log("🔎 [auth.service] Dados enviados para API:", data);
      console.log("🔎 [auth.service] Resposta bruta da API:", response);
      console.log("🔎 [auth.service] response.data:", response.data);

      console.log("✅ Perfil completado com sucesso");
      return response.data;
    } catch (error) {
      console.error("❌ Erro ao completar perfil:", error);

      if (error instanceof AxiosError) {
        switch (error.response?.status) {
          case 400:
            throw new Error(
              "Dados inválidos. Verifique os campos e tente novamente."
            );
          case 401:
            throw new Error("Não autorizado. Faça login novamente.");
          default:
            throw new Error(error.message || "Erro ao completar perfil");
        }
      }
      throw error;
    }
  },
};
