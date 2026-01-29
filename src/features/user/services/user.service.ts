import { AxiosError } from "axios";
import { UpdateUserRequest, User } from "../types/user.types";
import { api } from "../../../services/api";

export const userService = {
  //Método para buscar dados
  fetchUser: async (): Promise<User> => {
    try {
      const response = await api.get<User>("/usuarios/me");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        switch (error.response?.status) {
          case 401:
            throw new Error("Não Autenticado.");
          case 500:
            throw new Error("Erro interno do servidor.");
          default:
            throw new Error("Erro ao buscar dados do usuario.");
        }
      }
      throw error;
    }
  },

  // Método para atualizar dados do usuário
  updateUser: async (data: UpdateUserRequest): Promise<User> => {
    try {
      const response = await api.patch<User>(
        "/usuarios/atualizar-perfil",
        data
      );

      return response.data;
    } catch (error) {
      console.error("❌ Erro ao atualizar perfil:", error);
      if (error instanceof AxiosError) {
        switch (error.response?.status) {
          case 400:
            throw new Error(
              "Dados inválidos. Verifique os campos e tente novamente."
            );
          case 401:
            throw new Error("Sessão expirada. Faça login novamente.");
          case 500:
            throw new Error("Erro no servidor. Tente novamente mais tarde.");
          default:
            throw new Error(error.message || "Erro ao atualizar perfil");
        }
      }
      throw error;
    }
  },
};
