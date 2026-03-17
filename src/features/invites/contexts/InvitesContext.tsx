import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";

import { useAuth } from "@/src/features/auth/contexts";
import { inviteService } from "@/src/features/invites/services/invite.service";
import type {
  GetInvitesByUser,
  Invite,
  InviteRequest,
} from "@/src/features/invites/types/invite.types";
import { StatusInvite } from "@/src/features/invites/types/invite.types";
import { getErrorMessage } from "@/src/services/httpError";

const inviteKeys = {
  all: ["invites"] as const,
  byUser: () => [...inviteKeys.all, "me"] as const,
  byRepublic: (republicId: string) =>
    [...inviteKeys.all, "republic", republicId] as const,
};

function updateInviteList(
  currentInvites: Invite[] | undefined,
  invite: Invite
) {
  const invites = currentInvites ?? [];
  const alreadyExists = invites.some((item) => item.id === invite.id);

  if (alreadyExists) {
    return invites.map((item) => (item.id === invite.id ? invite : item));
  }

  return [invite, ...invites];
}

export function useInvitesByUserQuery() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: inviteKeys.byUser(),
    queryFn: ({ signal }) => inviteService.getInvitesByUser(signal),
    enabled: isAuthenticated,
  });
}

export function useInvitesByRepublicQuery(republicId: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: inviteKeys.byRepublic(republicId),
    queryFn: ({ signal }) =>
      inviteService.getInvitesByRepublicId(republicId, signal),
    enabled: isAuthenticated && Boolean(republicId),
  });
}

export function useSendInviteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inviteService.sendInvite,
    onSuccess: (invite, payload) => {
      const republicId = invite.republicaId ?? payload.republicaId;

      queryClient.setQueryData<Invite[]>(
        inviteKeys.byRepublic(republicId),
        (currentInvites) => updateInviteList(currentInvites, invite)
      );
    },
  });
}

export function useUpdateInviteStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      inviteId,
      status,
    }: {
      inviteId: string;
      status: StatusInvite;
    }) => inviteService.patchInviteStatus(inviteId, status),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<GetInvitesByUser[]>(
        inviteKeys.byUser(),
        (currentInvites) =>
          (currentInvites ?? []).filter(
            (invite) => invite.id !== variables.inviteId
          )
      );
    },
  });
}

export function usePendingInvitesCount() {
  const { data } = useInvitesByUserQuery();

  return useMemo(
    () =>
      (data ?? []).filter((invite) => invite.status === StatusInvite.PENDENTE)
        .length,
    [data]
  );
}

export function useInvitesContext() {
  const router = useRouter();
  const inboxQuery = useInvitesByUserQuery();
  const sendInviteMutation = useSendInviteMutation();
  const updateInviteStatusMutation = useUpdateInviteStatusMutation();
  const invitesByUser = useMemo(() => inboxQuery.data ?? [], [inboxQuery.data]);
  const refetchInvitesByUser = inboxQuery.refetch;
  const updateInviteStatus = updateInviteStatusMutation.mutateAsync;
  const sendInviteAsync = sendInviteMutation.mutateAsync;
  const pendingCount = useMemo(
    () =>
      invitesByUser.filter((invite) => invite.status === StatusInvite.PENDENTE)
        .length,
    [invitesByUser]
  );

  const fetchInvitesByUser = useCallback(async () => {
    await refetchInvitesByUser();
  }, [refetchInvitesByUser]);
  const handleAcceptInvite = useCallback(
    async (inviteId: string, republicaId: string) => {
      try {
        await updateInviteStatus({
          inviteId,
          status: StatusInvite.ACEITO,
        });
        router.replace(`/(republics)/${republicaId}`);
      } catch (error) {
        console.error("Erro ao aceitar convite:", error);
      }
    },
    [router, updateInviteStatus]
  );

  const handleRejectInvite = useCallback(
    async (inviteId: string) => {
      try {
        await updateInviteStatus({
          inviteId,
          status: StatusInvite.RECUSADO,
        });
      } catch (error) {
        console.error("Erro ao recusar convite:", error);
      }
    },
    [updateInviteStatus]
  );

  const error = inboxQuery.error ?? updateInviteStatusMutation.error;
  const sendError = sendInviteMutation.error;
  const sendInvite = useCallback(
    (payload: InviteRequest) => sendInviteAsync(payload),
    [sendInviteAsync]
  );

  return {
    invitesByUser,
    pendingCount,
    error: error
      ? getErrorMessage(error, "Não foi possível carregar os convites.")
      : null,
    fetchInvitesByUser,
    handleAcceptInvite,
    handleRejectInvite,
    sendInvite,
    sendLoading: sendInviteMutation.isPending,
    sendError: sendError
      ? getErrorMessage(sendError, "Erro ao enviar convite.")
      : null,
  };
}
