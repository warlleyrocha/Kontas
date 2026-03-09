import { useCallback } from "react";

import { useAccountActions } from "./useAccountActions";
import { useAccountExpansion } from "./useAccountExpansion";
import { useAccountList } from "./useAccountList";
import type { MetodoPagamento } from "../types/account.types";

interface UseAccountsTabParams {
  readonly republicId: string;
}

export function useAccountsTab({ republicId }: UseAccountsTabParams) {
  const {
    refresh,
    contasOrdenadas,
    mesesDisponiveis,
    mesSelecionado,
    mostrarContasAbertas,
    mostrarContasPagas,
    loading,
    error,
    setMesSelecionado,
    setMostrarContasPagas,
    setMostrarContasAbertas,
    accountResidentsById,
    loadingResidentsById,
    errorResidentsById,
    updatingResidentById,
    confirmResidentPayment,
  } = useAccountList({ republicId });

  const { expandedAccountId, handleToggleExpand } = useAccountExpansion({
    republicId,
  });

  const {
    showAccountModal,
    setShowAccountModal,
    handleSubmit,
    handleDelete,
    handlePatch,
  } = useAccountActions({ onRefresh: refresh });

  const openAccountModal = useCallback(() => {
    setShowAccountModal(true);
  }, [setShowAccountModal]);

  const closeAccountModal = useCallback(() => {
    setShowAccountModal(false);
  }, [setShowAccountModal]);

  const toggleOpenAccounts = useCallback(() => {
    setMostrarContasAbertas(!mostrarContasAbertas);
  }, [mostrarContasAbertas, setMostrarContasAbertas]);

  const togglePaidAccounts = useCallback(() => {
    setMostrarContasPagas(!mostrarContasPagas);
  }, [mostrarContasPagas, setMostrarContasPagas]);

  const handlePatchAndRefresh = useCallback(
    async (accountId: string, metodoPagamento: MetodoPagamento) => {
      await handlePatch(accountId, metodoPagamento);
      await refresh();
    },
    [handlePatch, refresh],
  );

  const hasNoAccounts =
    contasOrdenadas.abertas.length === 0 && contasOrdenadas.pagas.length === 0;

  return {
    accountResidentsById,
    closeAccountModal,
    confirmResidentPayment,
    contasOrdenadas,
    error,
    errorResidentsById,
    expandedAccountId,
    handleDelete,
    handlePatchAndRefresh,
    handleSubmit,
    handleToggleExpand,
    hasNoAccounts,
    loading,
    loadingResidentsById,
    mesSelecionado,
    mesesDisponiveis,
    mostrarContasAbertas,
    mostrarContasPagas,
    openAccountModal,
    setMesSelecionado,
    showAccountModal,
    toggleOpenAccounts,
    togglePaidAccounts,
    updatingResidentById,
  };
}
