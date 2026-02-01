import { api } from "@/src/services/api";
import {
  Invite,
  InviteRequest,
  PatchInviteStatusResponse,
  StatusInvite,
  getInvitesByEmail,
} from "@/src/features/invites/types/invite.types";
import { AxiosError } from "axios";

export const inviteService = {
  // Método para enviar um convite
  sendInvite: async (data: InviteRequest): Promise<Invite> => {
    try {
      const response = await api.post<Invite>("/convites", data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        switch (error.response?.status) {
          case 400:
            throw new Error("Requisição inválida.");
          case 401:
            throw new Error("Não autenticado.");
          case 500:
            throw new Error("Erro interno do servidor.");
          default:
            throw new Error("Erro ao enviar convite.");
        }
      }
      throw error;
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
      if (error instanceof AxiosError) {
        switch (error.response?.status) {
          case 401:
            throw new Error("Não autenticado.");
          case 500:
            throw new Error("Erro interno do servidor.");
          default:
            throw new Error("Erro ao obter convites.");
        }
      }
      throw error;
    }
  },

  // Método para listar convites por email
  getInvitesByEmail: async (): Promise<getInvitesByEmail[]> => {
    console.log("Iniciando GET de convites");
    try {
      const response = await api.get<getInvitesByEmail[]>("/convites/me");
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Erro no getInvitesByEmail", error);
      if (error instanceof AxiosError) {
        console.log("Status:", error.response?.status);
        console.log("Data:", error.response?.data);
        switch (error.response?.status) {
          case 401:
            throw new Error("Não autenticado.");
          case 500:
            throw new Error("Erro interno do servidor.");
          default:
            throw new Error("Erro ao obter repúblicas.");
        }
      }
      throw error;
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
      if (error instanceof AxiosError) {
        switch (error.response?.status) {
          case 400:
            throw new Error("Requisição inválida.");
          case 401:
            throw new Error("Não autenticado.");
          case 500:
            throw new Error("Erro interno do servidor.");
          default:
            throw new Error("Erro ao atualizar status do convite.");
        }
      }
      throw error;
    }
  },
};
