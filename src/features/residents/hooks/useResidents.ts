import { useCallback } from "react";

import type { ResidentResponse } from "@/src/shared/types/resident.types";
import { useResidentsByRepublicQuery } from "./useResidentQueries";

type UseResidentsReturn = {
  residents: ResidentResponse[];
  isLoading: boolean;
  fetchResidents: () => Promise<ResidentResponse[] | null>;
};

export function useResidents(republicId: string): UseResidentsReturn {
  const { data: residents = [], isFetching, refetch } =
    useResidentsByRepublicQuery(republicId);

  const fetchResidents = useCallback(async () => {
    const result = await refetch();
    return result.data ?? null;
  }, [refetch]);

  return {
    residents,
    isLoading: isFetching,
    fetchResidents,
  };
}
