import {
  RepublicPost,
  RepublicResponse,
} from "@/src/features/republic/types/republic.types";
import { api } from "@/src/services/api";
import { toUserFriendlyError } from "@/src/services/httpError";

export const republicService = {
  // Método para criar uma nova república
  createRepublic: async (data: RepublicPost): Promise<RepublicResponse> => {
    try {
      const response = await api.post<RepublicResponse>("/republicas", data);
      return response.data;
    } catch (error) {
      throw toUserFriendlyError(error, {
        defaultMessage: "Erro ao criar república.",
        statusMessages: {
          400: "Requisição inválida.",
          401: "Não autenticado.",
          500: "Erro interno do servidor.",
        },
      });
    }
  },

  //Método para obter a lista de repúblicas
  getRepublics: async (): Promise<RepublicResponse[]> => {
    console.log("🌐 Chamando GET /republicas...");
    try {
      const response = await api.get<RepublicResponse[]>("/republicas");

      return response.data;
    } catch (error) {
      console.error("❌ Erro no getRepublics:", error);
      throw toUserFriendlyError(error, {
        defaultMessage: "Erro ao obter repúblicas.",
        statusMessages: {
          401: "Não autenticado.",
          500: "Erro interno do servidor.",
        },
      });
    }
  },

  // Método para obter detalhes de uma república específica
  getRepublicById: async (id: string): Promise<RepublicResponse> => {
    try {
      const response = await api.get<RepublicResponse>(`/republicas/${id}`);

      return response.data;
    } catch (error) {
      throw toUserFriendlyError(error, {
        defaultMessage: "Erro ao obter detalhes da república.",
        statusMessages: {
          400: "Requisição inválida.",
          401: "Não autenticado.",
          500: "Erro interno do servidor.",
        },
      });
    }
  },

  // Método para atualizar uma república
  updateRepublic: async (
    id: string,
    data: Partial<RepublicPost>
  ): Promise<RepublicResponse> => {
    try {
      const response = await api.patch<RepublicResponse>(
        `/republicas/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      throw toUserFriendlyError(error, {
        defaultMessage: "Erro ao atualizar república.",
        statusMessages: {
          400: "Requisição inválida.",
          401: "Não autenticado.",
          500: "Erro interno do servidor.",
        },
      });
    }
  },

  // Método para deletar uma república
  deleteRepublic: async (id: string): Promise<void> => {
    try {
      await api.delete(`/republicas/${id}`);
    } catch (error) {
      throw toUserFriendlyError(error, {
        defaultMessage: "Erro ao deletar república.",
        statusMessages: {
          400: "Requisição inválida.",
          401: "Não autenticado.",
          500: "Erro interno do servidor.",
        },
      });
    }
  },
};
