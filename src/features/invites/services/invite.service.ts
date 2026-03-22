import { isAxiosError } from "axios";
import {
  GetInvitesByUser,
  Invite,
  InviteRequest,
  PatchInviteStatusResponse,
  StatusInvite,
} from "@/src/features/invites/types/invite.types";
import { api } from "@/src/services/api";
import { toUserFriendlyError } from "@/src/services/httpError";
import { logger } from "@/src/shared/utils/logger";

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
  getInvitesByRepublicId: async (
    republicaId: string,
    signal?: AbortSignal
  ): Promise<Invite[]> => {
    try {
      const response = await api.get<Invite[]>(
        `/convites/republica/${republicaId}`,
        { signal }
      );
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.code === "ERR_CANCELED") {
        throw error;
      }
      throw toUserFriendlyError(error, {
        defaultMessage: "Erro ao obter convites.",
        statusMessages: {
          401: "Não autenticado.",
          404: "Nenhum convite encontrado para este usuário.",
          500: "Erro interno do servidor.",
        },
      });
    }
  },

  // Método para listar convites por usuario
  getInvitesByUser: async (
    signal?: AbortSignal
  ): Promise<GetInvitesByUser[]> => {
    logger.info("Invites", "Buscando convites do usuário");
    try {
      const response = await api.get<GetInvitesByUser[]>("/convites/me", {
        signal,
      });
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.code === "ERR_CANCELED") {
        throw error;
      }
      logger.error(
        "Invites",
        "Erro ao buscar convites do usuário",
        error instanceof Error ? error : undefined
      );
      throw toUserFriendlyError(error, {
        defaultMessage: "Erro ao obter convites.",
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
