import { useQueries } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import { useAuth } from "@/src/features/auth/hooks/useAuth";
import type { RepublicResponse } from "@/src/features/republic/types/republic.types";
import { residentKeys } from "@/src/features/residents/hooks/resident.keys";
import { residentService } from "@/src/features/residents/services/resident.service";
import type { ResidentResponse } from "@/src/shared/types/resident.types";
import { ResidentRole } from "@/src/shared/types/resident.types";

interface RepublicResidentsQueryResult {
  data: ResidentResponse[][];
  isLoading: boolean;
}

export function useRepublicResidents(
  republics: RepublicResponse[],
  currentUserEmail?: string | null,
  enabled = true,
) {
  const { isAuthenticated } = useAuth();

  const queries = useQueries({
    queries: republics.map((republic) => ({
      queryKey: residentKeys.byRepublic(republic.id),
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        residentService.getResidents(republic.id, signal),
      enabled: isAuthenticated && enabled,
      staleTime: 60_000,
    })),
    combine: (results): RepublicResidentsQueryResult => ({
      data: results.map((r) => r.data ?? []),
      isLoading: results.some((r) => r.isLoading),
    }),
  });

  const residentsCount = useMemo(
    () =>
      Object.fromEntries(
        republics.map((republic, index) => [
          republic.id,
          queries.data[index]?.length ?? 0,
        ]),
      ),
    [republics, queries.data],
  );

  const userRolesByRepublic = useMemo(() => {
    if (!currentUserEmail) return {} as Record<string, ResidentRole | null>;
    const normalizedEmail = currentUserEmail.toLowerCase();
    return Object.fromEntries(
      republics.map((republic, index) => {
        const residents = queries.data[index] ?? [];
        const match = residents.find(
          (r) => r.email.toLowerCase() === normalizedEmail,
        );
        return [republic.id, match?.role ?? null];
      }),
    );
  }, [republics, queries.data, currentUserEmail]);

  const getResidentsCount = useCallback(
    (republicId: string): number => residentsCount[republicId] ?? 0,
    [residentsCount],
  );

  const getUserRole = useCallback(
    (republicId: string): ResidentRole | null =>
      userRolesByRepublic[republicId] ?? null,
    [userRolesByRepublic],
  );

  const isAdmin = useCallback(
    (republicId: string): boolean =>
      userRolesByRepublic[republicId] === ResidentRole.ADMIN,
    [userRolesByRepublic],
  );

  return {
    residentsCount,
    getResidentsCount,
    getUserRole,
    isAdmin,
  };
}
