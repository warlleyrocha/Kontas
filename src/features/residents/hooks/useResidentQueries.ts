import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { residentService } from "../services/resident.service";
import { residentKeys } from "./resident.keys";

export function useResidentsByRepublicQuery(republicId: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: residentKeys.byRepublic(republicId),
    queryFn: ({ signal }) => residentService.getResidents(republicId, signal),
    enabled: isAuthenticated && Boolean(republicId),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}
