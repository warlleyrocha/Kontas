import { inviteService } from "@/src/features/invites/services/invite.service";
import {
  type getInvitesByEmail,
  type Invite,
  type InviteRequest,
  type PatchInviteStatusResponse,
  type StatusInvite,
} from "@/src/features/invites/types/invite.types";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";

export function useInvites() {
  const router = useRouter();

  const [invites, setInvites] = useState<Invite[]>([]);
  const [invitesByEmail, setInvitesByEmail] = useState<getInvitesByEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Enviar convite
  const sendInvite = useCallback(async (payload: InviteRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await inviteService.sendInvite(payload);

      return response;
    } catch (err: any) {
      setError(err.message || "Erro ao enviar convite.");
      throw err;
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
    } catch (err: any) {
      setError(err.message || "Erro ao buscar convites.");
    } finally {
      setLoading(false);
    }
  }, []);

  // BUscar convites por email
  const fetchInvitesByEmail = useCallback(async () => {
    try {
      const data = await inviteService.getInvitesByEmail();
      setInvitesByEmail(data);
    } catch (error) {
      console.error("Erro ao buscar republicas no hook: ", error);
      Alert.alert(
        "Erro",
        "Não foi possível carregar as repúblicas. Tente novamente."
      );
      setInvitesByEmail([]);
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
      } catch (err: any) {
        setError(err.message || "Erro ao atualizar convite.");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleAcceptInvite = useCallback(
    (id: string) => {
      console.log("Aceitar convite:", id);
      setInvites((prev) => prev.filter((invite) => invite.id !== id));
      router.push("/register/residents");
    },
    [router]
  );

  const handleRejectInvite = useCallback((id: string) => {
    console.log("Recusar convite:", id);
    setInvites((prev) => prev.filter((invite) => invite.id !== id));
  }, []);

  return {
    invitesByEmail,
    invites,
    loading,
    error,
    fetchInvites,
    fetchInvitesByEmail,
    sendInvite,
    updateInviteStatus,
    handleAcceptInvite,
    handleRejectInvite,
  };
}
