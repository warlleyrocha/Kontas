import { useRouter } from "expo-router";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { inviteService } from "@/src/features/invites/services/invite.service";
import {
  GetInvitesByUser,
  StatusInvite,
} from "@/src/features/invites/types/invite.types";
import { getErrorMessage } from "@/src/services/httpError";

interface InvitesContextData {
  invitesByUser: GetInvitesByUser[];
  pendingCount: number;
  error: string | null;
  fetchInvitesByUser: () => Promise<void>;
  handleAcceptInvite: (inviteId: string, republicaId: string) => Promise<void>;
  handleRejectInvite: (inviteId: string) => Promise<void>;
}

const InvitesContext = createContext<InvitesContextData>(
  {} as InvitesContextData,
);

export function InvitesProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const [invitesByUser, setInvitesByUser] = useState<GetInvitesByUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchInvitesByUser = useCallback(async () => {
    setError(null);
    try {
      const data = await inviteService.getInvitesByUser();
      setInvitesByUser(data);
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível carregar os convites."));
      setInvitesByUser([]);
    }
  }, []);

  useEffect(() => {
    void fetchInvitesByUser();
  }, [fetchInvitesByUser]);

  const handleAcceptInvite = useCallback(
    async (inviteId: string, republicaId: string) => {
      try {
        await inviteService.patchInviteStatus(inviteId, StatusInvite.ACEITO);
        setInvitesByUser((prev) => prev.filter((i) => i.id !== inviteId));
        router.replace(`/(republics)/${republicaId}`);
      } catch (err) {
        setError(getErrorMessage(err, "Erro ao aceitar convite."));
      }
    },
    [router],
  );

  const handleRejectInvite = useCallback(async (inviteId: string) => {
    try {
      await inviteService.patchInviteStatus(inviteId, StatusInvite.RECUSADO);
      setInvitesByUser((prev) => prev.filter((i) => i.id !== inviteId));
    } catch (err) {
      setError(getErrorMessage(err, "Erro ao recusar convite."));
    }
  }, []);

  const pendingCount = useMemo(
    () =>
      invitesByUser.filter((i) => i.status === StatusInvite.PENDENTE).length,
    [invitesByUser],
  );

  const value = useMemo(
    () => ({
      invitesByUser,
      pendingCount,
      error,
      fetchInvitesByUser,
      handleAcceptInvite,
      handleRejectInvite,
    }),
    [
      invitesByUser,
      pendingCount,
      error,
      fetchInvitesByUser,
      handleAcceptInvite,
      handleRejectInvite,
    ],
  );

  return (
    <InvitesContext.Provider value={value}>{children}</InvitesContext.Provider>
  );
}

export function useInvitesContext() {
  const context = useContext(InvitesContext);
  if (!context) {
    throw new Error(
      "useInvitesContext deve ser usado dentro de InvitesProvider",
    );
  }
  return context;
}
