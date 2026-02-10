import { inviteService } from "@/src/features/invites/services/invite.service";
import {
  type GetInvitesByUser,
  type Invite,
  type InviteRequest,
  type PatchInviteStatusResponse,
  StatusInvite,
} from "@/src/features/invites/types/invite.types";
import { getErrorMessage } from "@/src/services/httpError";
import { useCallback, useState } from "react";
import { useRouter } from "expo-router";

export function useInvites() {
  const router = useRouter();

  const [invites, setInvites] = useState<Invite[]>([]);
  const [invitesByUser, setInvitesByUser] = useState<GetInvitesByUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Enviar convite
  const sendInvite = useCallback(async (payload: InviteRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await inviteService.sendInvite(payload);

      return response;
    } catch (error) {
      const message = getErrorMessage(error, "Erro ao enviar convite.");
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar convites da república
  const fetchInvites = useCallback(async (republicaId: string) => {
    if (!republicaId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await inviteService.getInvitesByRepublicId(republicaId);
      setInvites(data);
      return data;
    } catch (error) {
      setError(getErrorMessage(error, "Erro ao buscar convites."));
    } finally {
      setLoading(false);
    }
  }, []);

  // BUscar convites por email
  const fetchInvitesByUser = useCallback(async () => {
    setError(null);
    try {
      const data = await inviteService.getInvitesByUser();
      setInvitesByUser(data);
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Não foi possível carregar os convites."
      );
      console.error("Erro ao buscar convites no hook:", error);
      setError(message);
      setInvitesByUser([]);
    } finally {
      console.log("Busca dos convites encerrada.");
    }
  }, []);

  // Aceitar / recusar convite
  const updateInviteStatus = useCallback(
    async (
      inviteId: string,
      status: StatusInvite
    ): Promise<PatchInviteStatusResponse> => {
      setLoading(true);
      setError(null);
      try {
        const updated = await inviteService.patchInviteStatus(inviteId, status);

        // Atualiza no estado
        setInvites((prev) =>
          prev.map((i) =>
            i.id === inviteId ? { ...i, status: updated.status } : i
          )
        );

        return updated;
      } catch (error) {
        const message = getErrorMessage(error, "Erro ao atualizar convite.");
        setError(message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleAcceptInvite = useCallback(
    async (inviteId: string, republicaId: string) => {
      try {
        await updateInviteStatus(inviteId, StatusInvite.ACEITO);
        setInvites((prev) => prev.filter((invite) => invite.id !== inviteId));
        setInvitesByUser((prev) =>
          prev.filter((invite) => invite.id !== inviteId)
        );
        router.replace(`/(republics)/${republicaId}`);
      } catch {
        // erro já é setado dentro de updateInviteStatus
      }
    },
    [router, updateInviteStatus]
  );

  const handleRejectInvite = useCallback(
    async (id: string) => {
      try {
        await updateInviteStatus(id, StatusInvite.RECUSADO);
        setInvites((prev) => prev.filter((invite) => invite.id !== id));
        setInvitesByUser((prev) => prev.filter((invite) => invite.id !== id));
      } catch {
        // erro já é setado dentro de updateInviteStatus
      }
    },
    [updateInviteStatus]
  );

  return {
    invitesByUser,
    invites,
    loading,
    error,
    fetchInvites,
    fetchInvitesByUser,
    sendInvite,
    updateInviteStatus,
    handleAcceptInvite,
    handleRejectInvite,
  };
}
