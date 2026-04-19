import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

import { useRefresh } from "@/src/shared/contexts/RefreshContext";
import type { ResidentResponse } from "@/src/shared/types/resident.types";
import { residentKeys } from "./resident.keys";
import { useResidentsByRepublicQuery } from "./useResidentQueries";

type UseResidentsReturn = {
  residents: ResidentResponse[];
  isLoading: boolean;
  fetchResidents: () => Promise<ResidentResponse[] | null>;
};

export function useResidents(republicId: string): UseResidentsReturn {
  const queryClient = useQueryClient();
  const {
    data: residents = [],
    isFetching,
    refetch,
  } = useResidentsByRepublicQuery(republicId);

  const fetchResidents = useCallback(async () => {
    const result = await refetch();
    return result.data ?? null;
  }, [refetch]);

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: residentKeys.byRepublic(republicId),
    });
  }, [queryClient, republicId]);

  const { registerRefresh } = useRefresh();

  useEffect(() => {
    return registerRefresh(`residents-${republicId}`, refresh);
  }, [refresh, registerRefresh, republicId]);

  return {
    residents,
    isLoading: isFetching,
    fetchResidents,
  };
}
