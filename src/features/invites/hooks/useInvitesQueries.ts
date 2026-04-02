import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { inviteService } from "@/src/features/invites/services/invite.service";
import type {
  GetInvitesByUser,
  Invite,
} from "@/src/features/invites/types/invite.types";
import { StatusInvite } from "@/src/features/invites/types/invite.types";
import { useCurrentUserQuery } from "@/src/features/user/hooks/useUserQueries";

import { inviteKeys } from "./invite.keys";

function updateInviteList(
  currentInvites: Invite[] | undefined,
  invite: Invite,
) {
  const invites = currentInvites ?? [];
  const alreadyExists = invites.some((item) => item.id === invite.id);

  if (alreadyExists) {
    return invites.map((item) => (item.id === invite.id ? invite : item));
  }

  return [invite, ...invites];
}

export function useInvitesByUserQuery() {
  const { data: user = null } = useCurrentUserQuery();
  const isAuthenticated = Boolean(user);

  return useQuery({
    queryKey: inviteKeys.byUser(),
    queryFn: ({ signal }) => inviteService.getInvitesByUser(signal),
    enabled: isAuthenticated,
  });
}

export function useInvitesByRepublicQuery(republicId: string) {
  const { data: user = null } = useCurrentUserQuery();
  const isAuthenticated = Boolean(user);

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
        (currentInvites) => updateInviteList(currentInvites, invite),
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
            (invite) => invite.id !== variables.inviteId,
          ),
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
    [data],
  );
}
