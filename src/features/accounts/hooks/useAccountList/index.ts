// orquestrador, interface pública inalterada

import { useCallback, useEffect } from "react";

import { useAccountData } from "./useAccountData";
import { useAccountDerivedData } from "./useAccountDerivedData";
import { useAccountFilters } from "./useAccountFilters";
import { useAccountResidents } from "../useAccountResidents";

interface UseAccountListProps {
  readonly republicId: string;
}

export function useAccountList({ republicId }: UseAccountListProps) {
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
    loadResidents,
  } = useAccountResidents({ fetchAccountResidents });

  const refresh = useCallback(async () => {
    const data = await fetchAccounts();
    await loadResidents(data);
  }, [fetchAccounts, loadResidents]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

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
  };
}
