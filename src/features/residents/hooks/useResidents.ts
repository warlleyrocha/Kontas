import { useCallback, useState } from "react";
import { residentService } from "@/src/features/residents/services/resident.service";
import { getErrorMessage } from "@/src/services/httpError";
import { ResidentResponse } from "@/src/shared/types/resident.types";
import { showToast } from "@/src/shared/utils/showToast";

type UseResidentState = {
  residents: ResidentResponse[];
  isLoading: boolean;
};

type UseResidentActions = {
  fetchResidents: (republicId: string) => Promise<ResidentResponse[] | null>;
  setResidents: (residents: ResidentResponse[]) => void;
};

type UseResidentReturn = UseResidentState & UseResidentActions;

export function useResidents(): UseResidentReturn {
  const [residents, setResidents] = useState<ResidentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchResidents = useCallback(async (republicId: string) => {
    setIsLoading(true);
    try {
      const residentsData = await residentService.getResidents(republicId);
      setResidents(residentsData);
      return residentsData;
    } catch (error) {
      console.error("Erro ao buscar moradores:", error);
      showToast.error(
        getErrorMessage(error, "Não foi possível carregar os moradores.")
      );
      return null;
    } finally {
      setIsLoading(false); // Adicione isso para sempre desligar o loading
    }
  }, []);

  return {
    // State
    residents,
    isLoading,
    // Actions
    fetchResidents,
    setResidents,
  };
}
