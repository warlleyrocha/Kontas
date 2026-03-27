import { useCallback, useEffect, useMemo, useReducer, useState } from "react";

import { useAccountData } from "@/src/features/accounts/hooks/useAccountList/useAccountData";
import { accountResidentsService } from "@/src/features/accounts/services/account-residents.service";
import { StatusPagamento } from "@/src/features/accounts/types/accountResidents.types";
import type {
  PaymentAccount,
  PaymentStatusFilter,
} from "@/src/features/accounts/types/payments.types";
import { getMoradorStatusVisual } from "@/src/features/accounts/utils/accountStatus.utils";
import { getErrorMessage } from "@/src/services/httpError";
import { useRefresh } from "@/src/shared/contexts/RefreshContext";
import { useComponentLogger } from "@/src/shared/hooks/useComponentLogger";
import { showToast } from "@/src/shared/utils/showToast";

import {
  paymentsInitialState,
  paymentsReducer,
} from "../reducer/paymentsReducer";

interface UsePaymentsScreenParams {
  readonly republicId: string;
}

export function usePaymentsScreen({ republicId }: UsePaymentsScreenParams) {
  useComponentLogger("PaymentsScreen");

  const { refreshAll } = useRefresh();
  const { error, fetchAccounts, fetchAccountResidents } = useAccountData({
    republicId,
  });

  const [{ accounts: paymentAccounts, isLoading, isRefreshing }, dispatch] =
    useReducer(paymentsReducer, paymentsInitialState);

  const [confirmingResidentById, setConfirmingResidentById] = useState<
    Record<string, boolean>
  >({});

  const [selectedStatus, setSelectedStatus] = useState<PaymentStatusFilter>(
    StatusPagamento.AGUARDANDO_CONFIRMACAO,
  );

  const loadPayments = useCallback(
    async (isManualRefresh = false) => {
      dispatch({ type: isManualRefresh ? "REFRESH_START" : "LOAD_START" });

      try {
        const accounts = await fetchAccounts();

        const accountsWithPayments = await Promise.all(
          accounts.map(async (account) => {
            const residents = await fetchAccountResidents(account.id);
            const relevantResidents = residents.filter(
              (resident) =>
                getMoradorStatusVisual(resident) ===
                  StatusPagamento.AGUARDANDO_CONFIRMACAO ||
                getMoradorStatusVisual(resident) === StatusPagamento.PAGO,
            );

            if (relevantResidents.length === 0) {
              return null;
            }

            return {
              ...account,
              residents: relevantResidents,
            };
          }),
        );

        const filteredAccounts = accountsWithPayments
          .filter((account): account is PaymentAccount => account !== null)
          .sort(
            (firstAccount, secondAccount) =>
              new Date(firstAccount.vencimento).getTime() -
              new Date(secondAccount.vencimento).getTime(),
          );

        dispatch({ type: "LOAD_SUCCESS", accounts: filteredAccounts });
      } finally {
        dispatch({ type: "LOAD_DONE" });
      }
    },
    [fetchAccounts, fetchAccountResidents],
  );

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  const handleConfirmResidentPayment = useCallback(
    async (accountId: string, residentId: string) => {
      if (confirmingResidentById[residentId]) {
        return;
      }

      setConfirmingResidentById((previousState) => ({
        ...previousState,
        [residentId]: true,
      }));

      try {
        await accountResidentsService.confirmarPagamentoAdmin({
          id: residentId,
        });

        dispatch({ type: "CONFIRM_RESIDENT", accountId, residentId });

        await refreshAll();
        showToast.success("Pagamento marcado como PAGO.");
      } catch (error) {
        showToast.error(
          getErrorMessage(error, "Não foi possível atualizar o pagamento."),
        );
      } finally {
        setConfirmingResidentById((previousState) => {
          const nextState = { ...previousState };
          delete nextState[residentId];
          return nextState;
        });
      }
    },
    [confirmingResidentById, refreshAll],
  );

  const filteredPaymentAccounts = useMemo(
    () =>
      paymentAccounts
        .map((account) => {
          if (selectedStatus === "todos") {
            return account;
          }

          const filteredResidents = account.residents.filter(
            (resident) => getMoradorStatusVisual(resident) === selectedStatus,
          );

          if (filteredResidents.length === 0) {
            return null;
          }

          return {
            ...account,
            residents: filteredResidents,
          };
        })
        .filter((account): account is PaymentAccount => account !== null),
    [paymentAccounts, selectedStatus],
  );

  const filteredResidentsCount = useMemo(
    () =>
      filteredPaymentAccounts.reduce(
        (total, account) => total + account.residents.length,
        0,
      ),
    [filteredPaymentAccounts],
  );

  const subtitle = useMemo(() => {
    if (selectedStatus === StatusPagamento.PAGO) {
      if (filteredResidentsCount === 0)
        return "Nenhum pagamento marcado como PAGO";
      if (filteredResidentsCount === 1) return "1 pagamento marcado como PAGO";
      return `${filteredResidentsCount} pagamentos marcados como PAGO`;
    }

    if (selectedStatus === StatusPagamento.AGUARDANDO_CONFIRMACAO) {
      if (filteredResidentsCount === 0)
        return "Nenhum pagamento aguardando confirmação";
      if (filteredResidentsCount === 1)
        return "1 pagamento aguardando confirmação";
      return `${filteredResidentsCount} pagamentos aguardando confirmação`;
    }

    if (filteredResidentsCount === 0) return "Nenhum pagamento encontrado";
    if (filteredResidentsCount === 1) return "1 pagamento encontrado";
    return `${filteredResidentsCount} pagamentos encontrados`;
  }, [filteredResidentsCount, selectedStatus]);

  const statusOptions: { label: string; value: PaymentStatusFilter }[] = [
    { label: "Pendentes", value: StatusPagamento.AGUARDANDO_CONFIRMACAO },
    { label: "Pago", value: StatusPagamento.PAGO },
    { label: "Todos", value: "todos" },
  ];

  return {
    error,
    isLoading,
    isRefreshing,
    filteredPaymentAccounts,
    confirmingResidentById,
    selectedStatus,
    subtitle,
    statusOptions,
    loadPayments,
    handleConfirmResidentPayment,
    setSelectedStatus,
  };
}
