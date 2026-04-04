import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { useCurrentUserQuery } from "@/src/features/user/hooks/useUserQueries";
import { residentService } from "../services/resident.service";
import { residentKeys } from "./resident.keys";

export function useResidentsByRepublicQuery(republicId: string) {
  const { data: user = null } = useCurrentUserQuery();
  const isAuthenticated = Boolean(user);

  return useQuery({
    queryKey: residentKeys.byRepublic(republicId),
    queryFn: ({ signal }) => residentService.getResidents(republicId, signal),
    enabled: isAuthenticated && Boolean(republicId),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}
