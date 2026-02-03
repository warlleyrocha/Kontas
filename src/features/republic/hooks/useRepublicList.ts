// hooks/useRepublicList.ts
import { useCallback, useState } from "react";
import { republicService } from "../services/republic.service";
import type { RepublicResponse } from "../types/republic.types";
import { getErrorMessage } from "@/src/services/httpError";
import { showToast } from "@/src/utils/showToast";

export function useRepublicList() {
  const [republics, setRepublics] = useState<RepublicResponse[]>([]);

  // Função para buscar repúblicas
  const fetchRepublics = useCallback(async () => {
    try {
      const data = await republicService.getRepublics();
      setRepublics(data);
    } catch (error) {
      console.error("Erro ao buscar repúblicas:", error);
      showToast.error(
        getErrorMessage(error, "Não foi possível carregar as repúblicas.")
      );
      setRepublics([]);
    } finally {
      console.log("Busca de repúblicas finalizada.");
    }
  }, []);

  // Função para buscar repúblicas por ID
  const fetchRepublicById = useCallback(async (id: string) => {
    try {
      const republic = await republicService.getRepublicById(id);
      return republic;
    } catch (error) {
      console.error("Erro ao buscar república por ID:", error);
      showToast.error(
        getErrorMessage(error, "Não foi possível carregar a república.")
      );
      return null;
    }
  }, []);

  return {
    republics,
    setRepublics,
    fetchRepublics,
    fetchRepublicById,
  };
}
