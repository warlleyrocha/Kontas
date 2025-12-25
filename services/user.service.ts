import { AxiosError } from "axios";
import { UpdateUserRequest, User } from "../types/user.types";
import { api } from "./api";

export const userService = {
  // Método para atualizar dados do usuário
  updateUser: async (data: UpdateUserRequest): Promise<User> => {
    console.log("📤 Enviando dados atualizados do usuário para o backend...");
    try {
      const response = await api.patch<User>(
        "/auth/atualizar-dados-perfil",
        data
      );

      console.log("✅ Dados do usuário atualizados com sucesso.");

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
