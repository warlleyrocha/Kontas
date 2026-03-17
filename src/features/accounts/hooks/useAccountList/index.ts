// orquestrador, interface pública inalterada

import { useCallback, useEffect, useId } from "react";
import { useRefresh } from "@/src/shared/contexts/RefreshContext";
import { useAccountResidents } from "../useAccountResidents";
import { useAccountData } from "./useAccountData";
import { useAccountDerivedData } from "./useAccountDerivedData";
import { useAccountFilters } from "./useAccountFilters";

interface UseAccountListProps {
  readonly republicId: string;
}

export function useAccountList({ republicId }: UseAccountListProps) {
  const refreshRegistrationId = useId();
  const { contas, loading, error, fetchAccounts, fetchAccountResidents } =
    useAccountData({ republicId });

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

  const {
    accountResidentsById,
    loadingResidentsById,
    errorResidentsById,
    updatingResidentById,
    loadResidents,
    confirmResidentPayment,
  } = useAccountResidents({ fetchAccountResidents });

  const refresh = useCallback(async () => {
    const data = await fetchAccounts();
    await loadResidents(data);
  }, [fetchAccounts, loadResidents]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const { registerRefresh } = useRefresh();

  useEffect(() => {
    return registerRefresh(
      `accounts-${republicId}-${refreshRegistrationId}`,
      refresh
    );
  }, [refreshRegistrationId, registerRefresh, republicId, refresh]);

  return {
    // Estado
    loading,
    error,
    // Ação pública
    refresh,
    // Filtros
    mesSelecionado,
    mostrarContasAbertas,
    mostrarContasPagas,
    setMesSelecionado,
    setMostrarContasAbertas,
    setMostrarContasPagas,
    // Dados derivados
    mesesDisponiveis,
    contasOrdenadas,
    // Residents
    accountResidentsById,
    loadingResidentsById,
    errorResidentsById,
    updatingResidentById,
    confirmResidentPayment,
  };
}
