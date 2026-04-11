import { toUserFriendlyError } from "@/src/services/httpError";
import { logger } from "@/src/shared/utils/logger";
import { api } from "../../../services/api";
import {
  CompleteProfileRequest,
  UpdateUserRequest,
  User,
} from "../types/user.types";

export interface UploadPhotoApiResponse {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  chavePix: string;
  fotoPerfil: string;
}

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
      logger.error(
        "User",
        "Erro ao atualizar perfil",
        error instanceof Error ? error : undefined
      );
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

  completeProfile: async (data: CompleteProfileRequest): Promise<void> => {
    try {
      await api.post("/auth/completar-dados", data);
    } catch (error) {
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

  uploadProfilePhoto: async (uri: string): Promise<UploadPhotoApiResponse> => {
    try {
      const filename = uri.split("/").pop() ?? "photo.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      const formData = new FormData();
        formData.append('file', {
          uri,
          name: filename,
          type,
        } as any);

      const response = await api.patch<UploadPhotoApiResponse>(
        "/usuarios/foto-perfil",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error(
        "User",
        "Erro ao fazer upload da foto",
        error instanceof Error ? error : undefined
      );
      throw toUserFriendlyError(error, {
        defaultMessage: "Erro ao fazer upload da foto.",
        statusMessages: {
          400: "Imagem inválida. Escolha outra foto.",
          401: "Sessão expirada. Faça login novamente.",
          500: "Erro no servidor. Tente novamente mais tarde.",
        },
      });
    }
  },
};
