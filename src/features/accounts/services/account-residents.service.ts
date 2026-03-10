import { ListarContasResponse } from "@/src/features/accounts/types/account.types";
import {
  AtualizarVisibilidadeContaMoradorRequest,
  ContaMorador,
  ContaMoradorIdParams,
  VincularMoradoresRequest,
} from "@/src/features/accounts/types/accountResidents.types";
import { api } from "@/src/services/api";
import { toUserFriendlyError } from "@/src/services/httpError";

export const accountResidentsService = {
  vincularMoradores: async (
    data: VincularMoradoresRequest
  ): Promise<ContaMorador[]> => {
    try {
      const response = await api.post<ContaMorador[]>(
        "/contas-moradores",
        data
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

  listarContasMoradores: async (
    contaId: string
  ): Promise<ListarContasResponse> => {
    try {
      const response = await api.get<ListarContasResponse>(
        `/contas-moradores/conta/${contaId}`
      );
      console.log(
        `Contas listadas para os moradores ${contaId}:`,
        response.data
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

  listarContasPorMorador: async (
    moradorId: string
  ): Promise<ListarContasResponse> => {
    try {
      const response = await api.get<ListarContasResponse>(
        `contas-moradores/morador/${moradorId}`
      );
      console.log(`Lista de contas do morador ${moradorId}: `, response.data);
      return response.data;
    } catch (error) {
      throw toUserFriendlyError(error, {
        defaultMessage: "Erro ao obter contas dos moradores.",
        statusMessages: {
          401: "Não autenticado.",
          404: "Morador não encontrado.",
          500: "Erro interno do servidor.",
        },
      });
    }
  },

  // Método para registrar
  confirmarPagamentoMorador: async ({
    id,
  }: ContaMoradorIdParams): Promise<void> => {
    try {
      await api.patch(`/contas-moradores/${id}/pagar`);
      console.log(`Pagamento da conta ${id} enviado para o ADMIN`);
    } catch (error) {
      throw toUserFriendlyError(error, {
        defaultMessage: "Erro ao marcar conta como paga",
        statusMessages: {
          400: "Dados inválidos.",
          401: "Não Autenticado.",
          403: "Sem permissão.",
          404: "Registro não encontrado",
          409: "Pagamento já em processamento ou pago",
          500: "Erro interno do servidor",
        },
      });
    }
  },

  confirmarPagamentoAdmin: async ({
    id,
  }: ContaMoradorIdParams): Promise<ContaMorador> => {
    try {
      const response = await api.patch<ContaMorador>(
        `/contas-moradores/${id}/confirmar`
      );
      console.log(`Pagamento da conta ${id} confirmado pelo ADMIN`);
      return response.data;
    } catch (error) {
      throw toUserFriendlyError(error, {
        defaultMessage: "Erro ao confirmar pagamento.",
        statusMessages: {
          401: "Não autenticado.",
          403: "Apenas ADMIN pode confirmar pagamentos.",
          404: "Registro não encontrado.",
          409: "Pagamento não está aguardando confirmação.",
          500: "Erro interno do servidor.",
        },
      });
    }
  },

  atualizarVisibilidadeAdmin: async ({
    id,
    visivel,
  }: AtualizarVisibilidadeContaMoradorRequest): Promise<ContaMorador> => {
    try {
      const response = await api.patch<ContaMorador>(
        `/contas-moradores/${id}/visibilidade`,
        { visivel }
      );
      console.log(`Visibilidade da conta ${id} atualizada pelo ADMIN`);
      return response.data;
    } catch (error) {
      throw toUserFriendlyError(error, {
        defaultMessage: "Erro ao atualizar visibilidade.",
        statusMessages: {
          401: "Não autenticado.",
          403: "Apenas ADMIN pode alterar visibilidade.",
          404: "Registro não encontrado.",
          500: "Erro interno do servidor.",
        },
      });
    }
  },
};
