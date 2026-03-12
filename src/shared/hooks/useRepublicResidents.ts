import { useResidents } from "@/src/features/residents/hooks/useResidents";
import type { RepublicResponse } from "@/src/features/republic/types/republic.types";
import { ResidentRole } from "@/src/shared/types/resident.types";
import { useCallback, useEffect, useState } from "react";

export function useRepublicResidents(
  republics: RepublicResponse[],
  currentUserEmail?: string | null
) {
  const { fetchResidents } = useResidents();
  const [residentsCount, setResidentsCount] = useState<Record<string, number>>(
    {}
  );
  const [userRolesByRepublic, setUserRolesByRepublic] = useState<
    Record<string, ResidentRole | null>
  >({});
  const [loading, setLoading] = useState(false);

  const loadResidentsCount = useCallback(async () => {
    if (republics.length === 0) {
      setResidentsCount({});
      setUserRolesByRepublic({});
      return;
    }

    setLoading(true);
    const counts: Record<string, number> = {};
    const roles: Record<string, ResidentRole | null> = {};

    try {
      await Promise.all(
        republics.map(async (republic) => {
          try {
            const residents = await fetchResidents(republic.id);
            counts[republic.id] = residents?.length ?? 0;
            if (currentUserEmail) {
              const normalizedEmail = currentUserEmail.toLowerCase();
              const currentUser = residents?.find(
                (resident) => resident.email.toLowerCase() === normalizedEmail
              );
              roles[republic.id] = currentUser?.role ?? null;
            }
          } catch (error) {
            console.error(
              `Erro ao buscar moradores da república ${republic.id}:`,
              error
            );
            counts[republic.id] = 0;
            if (currentUserEmail) {
              roles[republic.id] = null;
            }
          }
        })
      );

      setResidentsCount(counts);
      setUserRolesByRepublic(currentUserEmail ? roles : {});
    } catch (error) {
      // Promise.all não deve rejeitar pois cada república trata seu próprio erro,
      // mas o catch externo satisfaz a análise de fluxo do compiler.
      console.error("Erro inesperado ao carregar moradores:", error);
    } finally {
      setLoading(false);
    }
  }, [republics, fetchResidents, currentUserEmail]);

  useEffect(() => {
    loadResidentsCount();
  }, [loadResidentsCount]);

  const getResidentsCount = useCallback(
    (republicId: string): number => {
      return residentsCount[republicId] ?? 0;
    },
    [residentsCount]
  );

  const getUserRole = useCallback(
    (republicId: string): ResidentRole | null => {
      return userRolesByRepublic[republicId] ?? null;
    },
    [userRolesByRepublic]
  );

  const isAdmin = useCallback(
    (republicId: string): boolean => {
      return userRolesByRepublic[republicId] === ResidentRole.ADMIN;
    },
    [userRolesByRepublic]
  );

  return {
    residentsCount,
    getResidentsCount,
    getUserRole,
    isAdmin,
    loading,
    refresh: loadResidentsCount,
  };
}
