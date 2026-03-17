import { toUserFriendlyError } from "@/src/services/httpError";
import { api } from "../../../services/api";
import { UpdateUserRequest, User } from "../types/user.types";

export const userService = {
  //Método para buscar dados
  fetchUser: async (): Promise<User> => {
    try {
      const response = await api.get<User>("/usuarios/me");
      return response.data;
    } catch (error) {
      throw toUserFriendlyError(error, {
        defaultMessage: "Erro ao buscar dados do usuário.",
        statusMessages: {
          401: "Não Autenticado.",
          500: "Erro interno do servidor.",
        },
      });
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
      throw toUserFriendlyError(error, {
        defaultMessage: "Erro ao atualizar perfil.",
        statusMessages: {
          400: "Dados inválidos. Verifique os campos e tente novamente.",
          401: "Sessão expirada. Faça login novamente.",
          500: "Erro no servidor. Tente novamente mais tarde.",
        },
      });
    }
  },
};
