import { api } from "@/src/services/api";
import {
  Invite,
  InviteRequest,
  PatchInviteStatusResponse,
  StatusInvite,
  GetInvitesByUser,
} from "@/src/features/invites/types/invite.types";
import { toUserFriendlyError } from "@/src/services/httpError";

export const inviteService = {
  // Método para enviar um convite
  sendInvite: async (data: InviteRequest): Promise<Invite> => {
    try {
      const response = await api.post<Invite>("/convites", data);
      return response.data;
    } catch (error) {
      throw toUserFriendlyError(error, {
        defaultMessage: "Erro ao enviar convite.",
        statusMessages: {
          400: "Requisição inválida.",
          401: "Não autenticado.",
          500: "Erro interno do servidor.",
        },
      });
    }
  },

  // Método para listar convites de uma república
  getInvitesByRepublicId: async (republicaId: string): Promise<Invite[]> => {
    try {
      const response = await api.get<Invite[]>(
        `/convites/republica/${republicaId}`
      );
      return response.data;
    } catch (error) {
      throw toUserFriendlyError(error, {
        defaultMessage: "Erro ao obter convites.",
        statusMessages: {
          401: "Não autenticado.",
          500: "Erro interno do servidor.",
        },
      });
    }
  },

  // Método para listar convites por usuario
  getInvitesByUser: async (): Promise<GetInvitesByUser[]> => {
    console.log("🌐 Chamando GET /convites/me...");
    try {
      const response = await api.get<GetInvitesByUser[]>("/convites/me");
      return response.data;
    } catch (error) {
      console.error("Erro no getInvitesByUser", error);
      throw toUserFriendlyError(error, {
        defaultMessage: "Erro ao obter repúblicas.",
        statusMessages: {
          401: "Não autenticado.",
          500: "Erro interno do servidor.",
        },
      });
    }
  },

  // Método para aceitar ou recusar convite
  patchInviteStatus: async (
    inviteId: string,
    status: StatusInvite
  ): Promise<PatchInviteStatusResponse> => {
    try {
      const response = await api.patch<PatchInviteStatusResponse>(
        `/convites/${inviteId}`,
        { status }
      );
      return response.data;
    } catch (error) {
      throw toUserFriendlyError(error, {
        defaultMessage: "Erro ao atualizar status do convite.",
        statusMessages: {
          400: "Requisição inválida.",
          401: "Não autenticado.",
          500: "Erro interno do servidor.",
        },
      });
    }
  },
};
