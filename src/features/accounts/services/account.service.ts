import { api } from "@/src/services/api";
import {
  Conta,
  CriarContaRequest,
  ListarContasRepublic,
  RemoverContaParams,
  MarcarContaPaga,
} from "@/src/features/accounts/types/account.types";

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

  // Método para recuperar uma conta deletada
  restaurarConta: async (id: string): Promise<void> => {
    try {
      await api.patch(`/contas/${id}/restaurar`);
      console.log(`Conta ${id} recuperada com sucesso.`);
    } catch (error) {
      throw toUserFriendlyError(error, {
        defaultMessage: "Erro ao recuperar conta.",
        statusMessages: {
          401: "Não autenticado.",
          403: "Apenas ADMIN pode restaurar conta.",
          404: "Conta não encontrada.",
          500: "Erro interno do servidor.",
        },
      });
    }
  },

  // Método para marcar uma conta como paga
  pagarConta: async ({
    id,
    metodoPagamento,
  }: MarcarContaPaga): Promise<void> => {
    try {
      await api.patch(`/contas/${id}`, { status: "PAGA", metodoPagamento });
      console.log(`Conta ${id} paga com sucesso`);
    } catch (error) {
      throw toUserFriendlyError(error, {
        defaultMessage: "Erro ao marcar conta como paga",
        statusMessages: {
          400: "Dados inválidos.",
          401: "Não Autenticado.",
          403: "Apenas ADMIN pode alterar a conta",
          404: "Conta não encontrada",
          500: "Erro interno do servidor",
        },
      });
    }
  },
};
