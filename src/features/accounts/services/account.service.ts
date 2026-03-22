import {
  Conta,
  CriarContaRequest,
  ListarContasRepublic,
  MarcarContaPaga,
  RemoverContaParams,
  StatusConta,
} from "@/src/features/accounts/types/account.types";
import { api } from "@/src/services/api";
import { toUserFriendlyError } from "@/src/services/httpError";
import { logger } from "@/src/shared/utils/logger";

export const accountService = {
  // Método para criar uma nova conta
  criarConta: async (data: CriarContaRequest): Promise<Conta> => {
    try {
      logger.debug("Accounts", "Payload de criação de conta", data);
      const response = await api.post<Conta>("/contas", data);
      logger.info("Accounts", "Conta criada com sucesso", response.data);
      return response.data;
    } catch (error) {
      throw toUserFriendlyError(error, {
        defaultMessage: "Erro ao criar conta.",
        statusMessages: {
          400: "Descrição não pode ser vazia.",
          401: "Não autenticado.",
          403: "Apenas ADMIN pode criar contas.",
          500: "Erro interno do servidor.",
        },
      });
    }
  },

  // Método para listar contas de uma república
  listarContasPorRepublica: async (
    republicaId: string
  ): Promise<ListarContasRepublic> => {
    try {
      const response = await api.get<ListarContasRepublic>(
        `/contas/republica/${republicaId}`
      );
      logger.table(
        "Accounts",
        `Contas da república ${republicaId}`,
        response.data as object
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
      logger.info("Accounts", `Conta ${id} removida com sucesso`);
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
      logger.info("Accounts", `Conta ${id} restaurada com sucesso`);
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
      await api.patch(`/contas/${id}`, {
        status: StatusConta.PAGA,
        metodoPagamento,
      });
      logger.info("Accounts", `Conta ${id} marcada como paga`);
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
