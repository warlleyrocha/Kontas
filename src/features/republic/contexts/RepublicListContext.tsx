import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/src/features/auth/contexts";
import { republicService } from "@/src/features/republic/services/republic.service";
import type { RepublicResponse } from "@/src/features/republic/types/republic.types";
import { getErrorMessage } from "@/src/services/httpError";
import { logger } from "@/src/shared/utils/logger";
import { showToast } from "@/src/shared/utils/showToast";

interface RepublicListContextData {
  republics: RepublicResponse[];
  setRepublics: React.Dispatch<React.SetStateAction<RepublicResponse[]>>;
  fetchRepublics: () => Promise<void>;
  fetchRepublicById: (id: string) => Promise<RepublicResponse | null>;
}

const RepublicListContext = createContext<RepublicListContextData | undefined>(
  undefined
);

export function RepublicListProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { isAuthenticated } = useAuth();
  const [republics, setRepublics] = useState<RepublicResponse[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      setRepublics([]);
    }
  }, [isAuthenticated]);

  const fetchRepublics = useCallback(async () => {
    try {
      const data = await republicService.getRepublics();
      setRepublics(data);
    } catch (error) {
      logger.error(
        "Republic",
        "Erro ao buscar repúblicas",
        error instanceof Error ? error : undefined
      );
      showToast.error(
        getErrorMessage(error, "Não foi possível carregar as repúblicas.")
      );
      setRepublics([]);
    } finally {
      logger.info("Republic", "Busca de repúblicas finalizada");
    }
  }, []);

  const fetchRepublicById = useCallback(async (id: string) => {
    try {
      return await republicService.getRepublicById(id);
    } catch (error) {
      logger.error(
        "Republic",
        "Erro ao buscar república por ID",
        error instanceof Error ? error : undefined
      );
      showToast.error(
        getErrorMessage(error, "Não foi possível carregar a república.")
      );
      return null;
    }
  }, []);

  const contextValue = useMemo(
    () => ({ republics, setRepublics, fetchRepublics, fetchRepublicById }),
    [republics, fetchRepublics, fetchRepublicById]
  );

  return (
    <RepublicListContext.Provider value={contextValue}>
      {children}
    </RepublicListContext.Provider>
  );
}

export function useRepublicListContext() {
  const context = useContext(RepublicListContext);
  if (!context) {
    throw new Error(
      "useRepublicListContext deve ser usado dentro de RepublicListProvider"
    );
  }
  return context;
}
