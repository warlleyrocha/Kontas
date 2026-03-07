import { useCallback, useState } from "react";

import { getErrorMessage } from "@/src/services/httpError";
import type { ContaMorador } from "@/src/shared/types/accountResidents.types";
import { showToast } from "@/src/utils/showToast";
import { accountResidentsService } from "../services/account-residents.service";
import type { Conta } from "../types/account.types";

interface UseAccountResidentsProps {
  fetchAccountResidents: (accountId: string) => Promise<ContaMorador[]>;
}

interface UseAccountResidentsReturn {
  accountResidentsById: Record<string, ContaMorador[]>;
  loadingResidentsById: Record<string, boolean>;
  errorResidentsById: Record<string, boolean>;
  updatingResidentById: Record<string, boolean>;
  loadResidents: (contas: Conta[]) => Promise<void>;
  confirmResidentPayment: (
    accountId: string,
    accountResidentId: string,
  ) => Promise<void>;
}

export function useAccountResidents({
  fetchAccountResidents,
}: UseAccountResidentsProps): UseAccountResidentsReturn {
  const [accountResidentsById, setAccountResidentsById] = useState<
    Record<string, ContaMorador[]>
  >({});
  const [loadingResidentsById, setLoadingResidentsById] = useState<
    Record<string, boolean>
  >({});
  const [errorResidentsById, setErrorResidentsById] = useState<
    Record<string, boolean>
  >({});
  const [updatingResidentById, setUpdatingResidentById] = useState<
    Record<string, boolean>
  >({});

  const loadResidents = useCallback(
    async (contas: Conta[]) => {
      setAccountResidentsById({});
      setLoadingResidentsById({});
      setErrorResidentsById({});
      setUpdatingResidentById({});

      if (contas.length === 0) {
        return;
      }

      const loadingMap = contas.reduce<Record<string, boolean>>(
        (acc, conta) => {
          acc[conta.id] = true;
          return acc;
        },
        {},
      );
      setLoadingResidentsById(loadingMap);

      const results = await Promise.allSettled(
        contas.map(async (conta) => {
          const moradores = await fetchAccountResidents(conta.id);
          return [conta.id, moradores] as const;
        }),
      );

      const residentsMap: Record<string, ContaMorador[]> = {};
      const errorMap: Record<string, boolean> = {};

      for (const [index, result] of results.entries()) {
        const contaId = contas[index].id;

        if (result.status === "fulfilled") {
          residentsMap[contaId] = result.value[1];
        } else {
          errorMap[contaId] = true;
        }
      }

      setAccountResidentsById(residentsMap);
      setErrorResidentsById(errorMap);
      setLoadingResidentsById({});
    },
    [fetchAccountResidents],
  );

  const confirmResidentPayment = useCallback(
    async (accountId: string, accountResidentId: string) => {
      if (updatingResidentById[accountResidentId]) {
        return;
      }

      setUpdatingResidentById((previousState) => ({
        ...previousState,
        [accountResidentId]: true,
      }));

      try {
        await accountResidentsService.confirmarPagamentoMorador({
          id: accountResidentId,
        });

        const updatedResidents = await fetchAccountResidents(accountId);

        setAccountResidentsById((previousState) => ({
          ...previousState,
          [accountId]: updatedResidents,
        }));

        showToast.success("Pagamento do morador enviado para confirmação.");
      } catch (error) {
        showToast.error(
          getErrorMessage(
            error,
            "Não foi possível confirmar pagamento do morador.",
          ),
        );
      } finally {
        setUpdatingResidentById((previousState) => {
          const nextState = { ...previousState };
          delete nextState[accountResidentId];
          return nextState;
        });
      }
    },
    [fetchAccountResidents, updatingResidentById],
  );

  return {
    accountResidentsById,
    loadingResidentsById,
    errorResidentsById,
    updatingResidentById,
    loadResidents,
    confirmResidentPayment,
  };
}
