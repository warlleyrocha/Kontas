import { api } from "@/src/services/api";
import {
  ContaMorador,
  VincularMoradoresRequest,
} from "@/src/shared/types/accountResidents.types";
import { ListarContasResponse } from "@/src/features/accounts/types/account.types";
import { toUserFriendlyError } from "@/src/services/httpError";

export const accountResidentsService = {
  vincularMoradores: async (
    data: VincularMoradoresRequest,
  ): Promise<ContaMorador[]> => {
    try {
      const response = await api.post<ContaMorador[]>(
        "/contas-moradores",
        data,
      );
      return response.data;
    } catch (error) {
      throw toUserFriendlyError(error, {
        defaultMessage: "Erro ao vincular moradores.",
        statusMessages: {
          400: "Dados inválidos.",
          401: "Não autenticado.",
          403: "Sem permissão.",
          404: "Conta não encontrada.",
          500: "Erro interno do servidor.",
        },
      });
    }
  },

  listarContasPorMoradores: async (
    contaId: string,
  ): Promise<ListarContasResponse> => {
    try {
      const response = await api.get<ListarContasResponse>(
        `/contas-moradores/conta/${contaId}`,
      );
      console.log(
        `Contas listadas para os moradores ${contaId}:`,
        response.data,
      );
      return response.data;
    } catch (error) {
      throw toUserFriendlyError(error, {
        defaultMessage: "Erro ao obter contas dos moradores.",
        statusMessages: {
          401: "Não autenticado.",
          404: "Nenhuma conta encontrada para estes moradores.",
          500: "Erro interno do servidor.",
        },
      });
    }
  },
};
