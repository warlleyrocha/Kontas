import {
  useMutation,
  useQuery,
  keepPreviousData,
  useQueryClient,
} from "@tanstack/react-query";

import { AppError } from "@/src/services/httpError";
import { useAuth } from "@/src/features/auth/hooks/useAuth";

import { republicService } from "../services/republic.service";
import type {
  RepublicPost,
  RepublicResponse,
} from "../types/republic.types";
import { republicKeys } from "./republic.keys";

interface RepublicQueryOptions {
  readonly enabled?: boolean;
}

type UpdateRepublicMutationVariables = {
  id: string;
  data: Partial<RepublicPost>;
};

function updateRepublicInList(
  currentRepublics: RepublicResponse[] | undefined,
  republic: RepublicResponse
) {
  const republics = currentRepublics ?? [];
  const hasRepublic = republics.some((item) => item.id === republic.id);

  if (!hasRepublic) {
    return [...republics, republic];
  }

  return republics.map((item) => (item.id === republic.id ? republic : item));
}

export function useRepublicsQuery(options: RepublicQueryOptions = {}) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: republicKeys.list(),
    queryFn: republicService.getRepublics,
    enabled: isAuthenticated && (options.enabled ?? true),
    staleTime: 60_000,
  });
}

export function useRepublicQuery(
  republicId: string,
  options: RepublicQueryOptions = {}
) {
  const { isAuthenticated } = useAuth();

  return useQuery<RepublicResponse | null>({
    queryKey: republicKeys.detail(republicId),
    queryFn: async () => {
      try {
        return await republicService.getRepublicById(republicId);
      } catch (error) {
        if (error instanceof AppError && error.status === 404) {
          return null;
        }

        throw error;
      }
    },
    enabled:
      isAuthenticated && Boolean(republicId) && (options.enabled ?? true),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}

export function useCreateRepublicMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: republicService.createRepublic,
    onSuccess: (republic) => {
      queryClient.setQueryData(republicKeys.detail(republic.id), republic);
      queryClient.setQueryData<RepublicResponse[]>(
        republicKeys.list(),
        (currentRepublics) => {
          const republics = currentRepublics ?? [];

          if (republics.some((item) => item.id === republic.id)) {
            return republics;
          }

          return [...republics, republic];
        }
      );
    },
  });
}

export function useUpdateRepublicMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateRepublicMutationVariables) =>
      republicService.updateRepublic(id, data),
    onSuccess: (republic) => {
      queryClient.setQueryData(republicKeys.detail(republic.id), republic);
      queryClient.setQueryData<RepublicResponse[]>(
        republicKeys.list(),
        (currentRepublics) => updateRepublicInList(currentRepublics, republic)
      );
    },
  });
}

export function useDeleteRepublicMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: republicService.deleteRepublic,
    onSuccess: (_, republicId) => {
      queryClient.setQueryData<RepublicResponse[]>(
        republicKeys.list(),
        (currentRepublics) =>
          (currentRepublics ?? []).filter((item) => item.id !== republicId)
      );
      queryClient.setQueryData(republicKeys.detail(republicId), null);
    },
  });
}
