// fetch, estado bruto, error, loading
import { useCallback, useRef, useState } from "react";

import { accountService } from "@/src/features/accounts/services/account.service";
import { accountResidentsService } from "../../services/account-residents.service";
import { getErrorMessage } from "@/src/services/httpError";
import { showToast } from "@/src/utils/showToast";
import type { Conta } from "@/src/features/accounts/types/account.types";
import type { ContaMorador } from "@/src/features/accounts/types/accountResidents.types";

interface UseAccountDataProps {
  readonly republicId: string;
}

interface UseAccountDataReturn {
  contas: Conta[];
  loading: boolean;
  error: Error | null;
  fetchAccounts: () => Promise<Conta[]>;
  fetchAccountResidents: (accountId: string) => Promise<ContaMorador[]>;
}

export function useAccountData({
  republicId,
}: UseAccountDataProps): UseAccountDataReturn {
  const [contas, setContas] = useState<Conta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const hasLoadedRef = useRef(false);

  const fetchAccounts = useCallback(async (): Promise<Conta[]> => {
    if (!hasLoadedRef.current) {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await accountService.listarContasPorRepublica(republicId);
      setContas(data);
      hasLoadedRef.current = true;
      return data;
    } catch (err) {
      const message = getErrorMessage(
        err,
        "Não foi possível carregar as contas."
      );
      console.error("Erro ao buscar contas:", err);
      showToast.error(message);
      setError(err instanceof Error ? err : new Error(message));
      setContas([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [republicId]);

  const fetchAccountResidents = useCallback(
    async (accountId: string): Promise<ContaMorador[]> => {
      try {
        return await accountResidentsService.listarContasMoradores(accountId);
      } catch (err) {
        const message = getErrorMessage(
          err,
          "Não foi possível carregar os moradores da conta."
        );
        console.error("Erro ao buscar moradores da conta:", err);
        showToast.error(message);
        return [];
      }
    },
    []
  );

  return {
    contas,
    loading,
    error,
    fetchAccounts,
    fetchAccountResidents,
  };
}
