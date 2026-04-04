import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { getErrorMessage } from "@/src/services/httpError";
import { useRefresh } from "@/src/shared/contexts/RefreshContext";
import { showToast } from "@/src/shared/utils/showToast";

import {
  useAccountResidentsByAccountQueries,
  useAccountsByRepublicQuery,
  useConfirmResidentPaymentMutation,
} from "../useAccountQueries";
import { accountKeys } from "../account.keys";
import { accountResidentKeys } from "../accountResident.keys";
import { useAccountDerivedData } from "./useAccountDerivedData";
import { useAccountFilters } from "./useAccountFilters";

interface UseAccountListProps {
  readonly republicId: string;
}

export function useAccountList({ republicId }: UseAccountListProps) {
  const refreshRegistrationId = useId();
  const queryClient = useQueryClient();
  const accountsQuery = useAccountsByRepublicQuery(republicId);
  const confirmResidentPaymentMutation = useConfirmResidentPaymentMutation();
  const contas = useMemo(() => accountsQuery.data ?? [], [accountsQuery.data]);
  const accountIds = useMemo(() => contas.map((conta) => conta.id), [contas]);
  const residentQueries = useAccountResidentsByAccountQueries(republicId, accountIds);
  const [updatingResidentById, setUpdatingResidentById] = useState<
    Record<string, boolean>
  >({});

  const {
    mesSelecionado,
    mostrarContasAbertas,
    mostrarContasPagas,
    setMesSelecionado,
    setMostrarContasAbertas,
    setMostrarContasPagas,
  } = useAccountFilters();

  const { mesesDisponiveis, contasOrdenadas } = useAccountDerivedData({
    contas,
    mesSelecionado,
  });

  const refresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: accountKeys.byRepublic(republicId),
      }),
      queryClient.invalidateQueries({
        queryKey: accountResidentKeys.byRepublic(republicId),
      }),
    ]);
  }, [queryClient, republicId]);

  const { registerRefresh } = useRefresh();

  useEffect(() => {
    return registerRefresh(
      `accounts-${republicId}-${refreshRegistrationId}`,
      refresh,
    );
  }, [refresh, refreshRegistrationId, registerRefresh, republicId]);

  const accountResidentsById = useMemo(
    () =>
      Object.fromEntries(
        accountIds.map((accountId, index) => [
          accountId,
          residentQueries.data[index] ?? [],
        ]),
      ),
    [accountIds, residentQueries.data],
  );

  const loadingResidentsById = useMemo(
    () =>
      Object.fromEntries(
        accountIds.map((accountId, index) => {
          const queryData = residentQueries.data[index];
          return [
            accountId,
            Boolean(residentQueries.isLoading || (!queryData && !residentQueries.errors[index])),
          ];
        }),
      ),
    [accountIds, residentQueries.data, residentQueries.isLoading, residentQueries.errors],
  );

  const errorResidentsById = useMemo(
    () =>
      Object.fromEntries(
        accountIds
          .map((accountId, index) => [
            accountId,
            Boolean(residentQueries.errors[index]),
          ])
          .filter(([, hasError]) => hasError),
      ),
    [accountIds, residentQueries.errors],
  );

  const confirmResidentPayment = useCallback(
    async (accountId: string, accountResidentId: string) => {
      if (updatingResidentById[accountResidentId]) {
        return;
      }

      setUpdatingResidentById((current) => ({
        ...current,
        [accountResidentId]: true,
      }));

      try {
        await confirmResidentPaymentMutation.mutateAsync({
          accountId,
          accountResidentId,
        });
        showToast.success("Pagamento do morador enviado para confirmação.");
      } catch (error) {
        showToast.error(
          getErrorMessage(
            error,
            "Não foi possível confirmar pagamento do morador.",
          ),
        );
      } finally {
        setUpdatingResidentById((current) => {
          const nextState = { ...current };
          delete nextState[accountResidentId];
          return nextState;
        });
      }
    },
    [confirmResidentPaymentMutation, updatingResidentById],
  );

  return {
    loading: accountsQuery.isLoading,
    error: accountsQuery.error instanceof Error ? accountsQuery.error : null,
    refresh,
    mesSelecionado,
    mostrarContasAbertas,
    mostrarContasPagas,
    setMesSelecionado,
    setMostrarContasAbertas,
    setMostrarContasPagas,
    mesesDisponiveis,
    contasOrdenadas,
    accountResidentsById,
    loadingResidentsById,
    errorResidentsById,
    updatingResidentById,
    confirmResidentPayment,
  };
}
