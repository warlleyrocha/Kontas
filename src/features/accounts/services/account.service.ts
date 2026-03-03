import { api } from "@/src/services/api";
import {
  Conta,
  CriarContaRequest,
  ListarContasResponse,
  ListarContasRepublic,
  RemoverContaParams,
} from "@/src/features/accounts/types/account.types";
import {
  ContaMorador,
  VincularMoradoresRequest,
} from "@/src/shared/types/accountResidents.types";
import { toUserFriendlyError } from "@/src/services/httpError";

export const accountService = {
  // Método para criar uma nova conta
  criarConta: async (data: CriarContaRequest): Promise<Conta> => {
    try {
      const response = await api.post<Conta>("/contas", data);
      console.log("Conta criada com sucesso:", response.data);
      return response.data;
    } catch (error) {
      throw toUserFriendlyError(error, {
        defaultMessage: "Erro ao criar conta.",
        statusMessages: {
          400: "Requisição inválida.",
          401: "Não autenticado.",
          500: "Erro interno do servidor.",
        },
      });
    }
  },

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

  // Método para listar contas de uma república
  listarContasPorRepublica: async (
    republicaId: string,
  ): Promise<ListarContasRepublic> => {
    try {
      const response = await api.get<ListarContasRepublic>(
        `/contas/republica/${republicaId}`,
      );
      console.log(
        `Contas listadas para república ${republicaId}:`,
        response.data,
      );
      return response.data;
    } catch (error) {
      throw toUserFriendlyError(error, {
        defaultMessage: "Erro ao obter contas.",
        statusMessages: {
          401: "Não autenticado.",
          404: "Nenhuma conta encontrada para esta república.",
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

  // Método para remover uma conta
  removerConta: async ({ id }: RemoverContaParams): Promise<void> => {
    try {
      await api.delete(`/contas/${id}`);
      console.log(`Conta ${id} removida com sucesso.`);
    } catch (error) {
      throw toUserFriendlyError(error, {
        defaultMessage: "Erro ao remover conta.",
        statusMessages: {
          401: "Não autenticado.",
          404: "Conta não encontrada.",
          500: "Erro interno do servidor.",
        },
      });
    }
  },
};
