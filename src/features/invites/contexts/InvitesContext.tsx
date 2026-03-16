import { useRouter } from "expo-router";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/src/features/auth/contexts";
import { inviteService } from "@/src/features/invites/services/invite.service";
import {
  GetInvitesByUser,
  Invite,
  InviteRequest,
  StatusInvite,
} from "@/src/features/invites/types/invite.types";
import { getErrorMessage } from "@/src/services/httpError";

interface InvitesContextData {
  // Inbox: convites recebidos pelo usuário
  invitesByUser: GetInvitesByUser[];
  /* Número de convites com status PENDENTE — usado pelo badge do menu lateral */
  pendingCount: number;
  error: string | null;
  fetchInvitesByUser: () => Promise<void>;
  handleAcceptInvite: (inviteId: string, republicaId: string) => Promise<void>;
  handleRejectInvite: (inviteId: string) => Promise<void>;

  // Outbox: convites enviados pela república
  /** Cache keyed por republicId para evitar re-fetch ao navegar de volta */
  invitesSentByRepublic: Record<string, Invite[]>;
  invitesSentError: string | null;
  invitesSentLoading: boolean;
  fetchInvitesByRepublic: (republicId: string) => Promise<void>;

  // --- Envio ---
  sendInvite: (payload: InviteRequest) => Promise<Invite>;
  sendLoading: boolean;
  sendError: string | null;
}

const InvitesContext = createContext<InvitesContextData>(
  {} as InvitesContextData,
);

export function InvitesProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // --- Estado: inbox ---
  const [invitesByUser, setInvitesByUser] = useState<GetInvitesByUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  // --- Estado: outbox ---
  // Record<republicId, Invite[]> permite cachear listas de múltiplas repúblicas
  // sem sobrescrever dados de outras repúblicas ao navegar entre telas.
  const [invitesSentByRepublic, setInvitesSentByRepublic] = useState<
    Record<string, Invite[]>
  >({});
  const [invitesSentError, setInvitesSentError] = useState<string | null>(null);
  const [invitesSentLoading, setInvitesSentLoading] = useState(false);

  // --- Estado: envio ---
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Busca todos os convites recebidos pelo usuário autenticado.
  // Chamado automaticamente ao autenticar (ver useEffect abaixo) e manualmente
  // via pull-to-refresh na InvitesScreen.
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

  // Pré-carrega os convites assim que o usuário se autentica para que o badge
  // do menu lateral já apareça com o valor correto ao abrir o app.
  useEffect(() => {
    if (isAuthenticated) {
      void fetchInvitesByUser();
    }
  }, [isAuthenticated, fetchInvitesByUser]);

  // Remove o convite da lista local e redireciona para a república aceita.
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

  // Quantidade de convites pendentes — derivada do estado, sem estado próprio.
  // Alimenta o badge do menu lateral e o dot no ícone de menu.
  const pendingCount = useMemo(
    () =>
      invitesByUser.filter((i) => i.status === StatusInvite.PENDENTE).length,
    [invitesByUser],
  );

  // Busca os convites enviados por uma república específica e armazena no cache.
  const fetchInvitesByRepublic = useCallback(async (republicId: string) => {
    setInvitesSentLoading(true);
    setInvitesSentError(null);
    try {
      const data = await inviteService.getInvitesByRepublicId(republicId);
      setInvitesSentByRepublic((prev) => ({ ...prev, [republicId]: data }));
    } catch (err) {
      setInvitesSentError(
        getErrorMessage(err, "Não foi possível carregar os convites enviados."),
      );
    } finally {
      setInvitesSentLoading(false);
    }
  }, []);

  // ENVIO
  const sendInvite = useCallback(async (payload: InviteRequest) => {
    setSendLoading(true);
    setSendError(null);
    try {
      return await inviteService.sendInvite(payload);
    } catch (err) {
      const message = getErrorMessage(err, "Erro ao enviar convite.");
      setSendError(message);
      throw err;
    } finally {
      setSendLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      invitesByUser,
      pendingCount,
      error,
      fetchInvitesByUser,
      handleAcceptInvite,
      handleRejectInvite,
      invitesSentByRepublic,
      invitesSentError,
      invitesSentLoading,
      fetchInvitesByRepublic,
      sendInvite,
      sendLoading,
      sendError,
    }),
    [
      invitesByUser,
      pendingCount,
      error,
      fetchInvitesByUser,
      handleAcceptInvite,
      handleRejectInvite,
      invitesSentByRepublic,
      invitesSentError,
      invitesSentLoading,
      fetchInvitesByRepublic,
      sendInvite,
      sendLoading,
      sendError,
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
