import { api } from "@/src/services/api";
import { toUserFriendlyError } from "@/src/services/httpError";
import type {
  AtualizarStatusContaRequest,
  AtualizarStatusContaResponse,
  Conta,
  CriarContaRequest,
} from "@/src/features/accounts/types/account.types";

export const accountService = {
  // Método para criar uma conta
  createAccount: async (data: CriarContaRequest): Promise<Conta> => {
    try {
      const response = await api.post<Conta>("/contas", data);
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
  getAccountsByRepublicId: async (republicaId: string): Promise<Conta[]> => {
    try {
      const response = await api.get<Conta[]>(
        `/contas/republica/${republicaId}`
      );
      return response.data;
    } catch (error) {
      throw toUserFriendlyError(error, {
        defaultMessage: "Erro ao obter contas.",
        statusMessages: {
          400: "ID da república inválido.",
          401: "Não autenticado.",
          404: "República não encontrada.",
          500: "Erro interno do servidor.",
        },
      });
    }
  },

  // Método para atualizar status da conta
  updateAccountStatus: async (
    id: string,
    data: AtualizarStatusContaRequest
  ): Promise<AtualizarStatusContaResponse> => {
    try {
      const response = await api.patch<AtualizarStatusContaResponse>(
        `/contas/${id}/status`,
        data
      );
      return response.data;
    } catch (error) {
      throw toUserFriendlyError(error, {
        defaultMessage: "Erro ao atualizar status da conta.",
        statusMessages: {
          400: "Requisição inválida.",
          401: "Não autenticado.",
          404: "Conta não encontrada.",
          500: "Erro interno do servidor.",
        },
      });
    }
  },

  // Método para remover conta
  deleteAccount: async (id: string): Promise<void> => {
    try {
      await api.delete(`/contas/${id}`);
    } catch (error) {
      throw toUserFriendlyError(error, {
        defaultMessage: "Erro ao remover conta.",
        statusMessages: {
          400: "Requisição inválida.",
          401: "Não autenticado.",
          404: "Conta não encontrada.",
          500: "Erro interno do servidor.",
        },
      });
    }
  },
};
