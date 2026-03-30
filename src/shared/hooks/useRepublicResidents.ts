import { useQueries } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import type { RepublicResponse } from "@/src/features/republic/types/republic.types";
import { residentKeys } from "@/src/features/residents/hooks/resident.keys";
import { residentService } from "@/src/features/residents/services/resident.service";
import { useCurrentUserQuery } from "@/src/features/user/hooks/useUserQueries";
import { ResidentRole } from "@/src/shared/types/resident.types";

export function useRepublicResidents(
  republics: RepublicResponse[],
  currentUserEmail?: string | null,
  enabled = true
) {
  const { data: user = null } = useCurrentUserQuery();
  const isAuthenticated = Boolean(user);

  const queries = useQueries({
    queries: republics.map((republic) => ({
      queryKey: residentKeys.byRepublic(republic.id),
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        residentService.getResidents(republic.id, signal),
      enabled: isAuthenticated && enabled,
      staleTime: 60_000,
    })),
  });

  const residentsCount = useMemo(
    () =>
      Object.fromEntries(
        republics.map((republic, index) => [
          republic.id,
          queries[index]?.data?.length ?? 0,
        ])
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [republics, queries]
  );

  const userRolesByRepublic = useMemo(() => {
    if (!currentUserEmail) return {} as Record<string, ResidentRole | null>;
    const normalizedEmail = currentUserEmail.toLowerCase();
    return Object.fromEntries(
      republics.map((republic, index) => {
        const residents = queries[index]?.data ?? [];
        const match = residents.find(
          (r) => r.email.toLowerCase() === normalizedEmail
        );
        return [republic.id, match?.role ?? null];
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [republics, queries, currentUserEmail]);

  const getResidentsCount = useCallback(
    (republicId: string): number => residentsCount[republicId] ?? 0,
    [residentsCount]
  );

  const getUserRole = useCallback(
    (republicId: string): ResidentRole | null =>
      userRolesByRepublic[republicId] ?? null,
    [userRolesByRepublic]
  );

  const isAdmin = useCallback(
    (republicId: string): boolean =>
      userRolesByRepublic[republicId] === ResidentRole.ADMIN,
    [userRolesByRepublic]
  );

  return {
    residentsCount,
    getResidentsCount,
    getUserRole,
    isAdmin,
  };
}
