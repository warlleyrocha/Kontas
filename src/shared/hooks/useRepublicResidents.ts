import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import type { RepublicResponse } from "@/src/features/republic/types/republic.types";
import { residentService } from "@/src/features/residents/services/resident.service";
import { ResidentRole } from "@/src/shared/types/resident.types";
import { logger } from "@/src/shared/utils/logger";

function isEmptyRecord(record: Record<string, unknown>) {
  return Object.keys(record).length === 0;
}

export function useRepublicResidents(
  republics: RepublicResponse[],
  currentUserEmail?: string | null,
  enabled = true
) {
  const { isAuthenticated } = useAuth();
  const [residentsCount, setResidentsCount] = useState<Record<string, number>>(
    {}
  );
  const [userRolesByRepublic, setUserRolesByRepublic] = useState<
    Record<string, ResidentRole | null>
  >({});

  const loadResidentsCount = useCallback(async () => {
    if (!enabled) {
      return;
    }

    if (!isAuthenticated || republics.length === 0) {
      setResidentsCount((current) => (isEmptyRecord(current) ? current : {}));
      setUserRolesByRepublic((current) =>
        isEmptyRecord(current) ? current : {}
      );
      return;
    }

    const counts: Record<string, number> = {};
    const roles: Record<string, ResidentRole | null> = {};

    try {
      await Promise.all(
        republics.map(async (republic) => {
          try {
            const residents = await residentService.getResidents(republic.id);
            counts[republic.id] = residents?.length ?? 0;
            if (currentUserEmail) {
              const normalizedEmail = currentUserEmail.toLowerCase();
              const currentUser = residents?.find(
                (resident) => resident.email.toLowerCase() === normalizedEmail
              );
              roles[republic.id] = currentUser?.role ?? null;
            }
          } catch (error) {
            logger.error(
              "Residents",
              `Erro ao buscar moradores da república ${republic.id}`,
              error instanceof Error ? error : undefined
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
      logger.error(
        "Residents",
        "Erro inesperado ao carregar moradores",
        error instanceof Error ? error : undefined
      );
    }
  }, [enabled, isAuthenticated, republics, currentUserEmail]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    void loadResidentsCount();
  }, [enabled, loadResidentsCount]);

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
    refresh: loadResidentsCount,
  };
}
