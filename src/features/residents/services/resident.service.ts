import { api } from "@/src/services/api";
import {
  CreateResidentRequest,
  ResidentResponse,
} from "@/src/shared/types/resident.types";
import { toUserFriendlyError } from "@/src/services/httpError";

export const residentService = {
  // Método para criar um novo morador
  createResident: async (
    data: CreateResidentRequest,
  ): Promise<ResidentResponse> => {
    try {
      const response = await api.post<ResidentResponse>("/moradores", data);
      return response.data;
    } catch (error) {
      throw toUserFriendlyError(error, {
        defaultMessage: "Erro ao criar morador.",
        statusMessages: {
          400: "Requisição inválida.",
          401: "Não autenticado.",
          500: "Erro interno do servidor.",
        },
      });
    }
  },

  // Método para obter a lista de moradores
  getResidents: async (id: string): Promise<ResidentResponse[]> => {
    try {
      const response = await api.get<ResidentResponse[]>(
        `/moradores/republica/${id}`,
      );
      return response.data;
    } catch (error) {
      throw toUserFriendlyError(error, {
        defaultMessage: "Erro ao obter moradores.",
        statusMessages: {
          400: "ID da república inválido.",
          401: "Não autenticado.",
          404: "República não encontrada.",
          500: "Erro interno do servidor.",
        },
      });
    }
  },
};
