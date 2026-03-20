import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import {
  PaymentsEmptyState,
  PaymentsErrorState,
  PaymentsLoadingState,
  PendingPaymentsList,
} from "@/src/features/accounts/components/payments";
import { useAccountData } from "@/src/features/accounts/hooks/useAccountList/useAccountData";
import { accountResidentsService } from "@/src/features/accounts/services/account-residents.service";
import { StatusPagamento } from "@/src/features/accounts/types/accountResidents.types";
import type {
  PaymentAccount,
  PaymentStatusFilter,
} from "@/src/features/accounts/types/payments.types";
import { getMoradorStatusVisual } from "@/src/features/accounts/utils/accountStatus.utils";
import { getErrorMessage } from "@/src/services/httpError";
import { ScreenLayout } from "@/src/shared/components/ScreenLayout";
import { useRefresh } from "@/src/shared/contexts/RefreshContext";
import { useComponentLogger } from "@/src/shared/hooks/useComponentLogger";
import { showToast } from "@/src/shared/utils/showToast";

type PaymentsState = {
  accounts: PaymentAccount[];
  isLoading: boolean;
  isRefreshing: boolean;
};

type PaymentsAction =
  | { type: "LOAD_START" }
  | { type: "REFRESH_START" }
  | { type: "LOAD_SUCCESS"; accounts: PaymentAccount[] }
  | { type: "LOAD_DONE" }
  | { type: "CONFIRM_RESIDENT"; accountId: string; residentId: string };

function paymentsReducer(
  state: PaymentsState,
  action: PaymentsAction
): PaymentsState {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, isLoading: true };
    case "REFRESH_START":
      return { ...state, isRefreshing: true };
    case "LOAD_SUCCESS":
      return { ...state, accounts: action.accounts };
    case "LOAD_DONE":
      return { ...state, isLoading: false, isRefreshing: false };
    case "CONFIRM_RESIDENT":
      return {
        ...state,
        accounts: state.accounts
          .map((account) => {
            if (account.id !== action.accountId) return account;
            return {
              ...account,
              residents: account.residents.map((resident) =>
                resident.id === action.residentId
                  ? {
                      ...resident,
                      pagoEm: new Date().toISOString(),
                      status: StatusPagamento.PAGO,
                    }
                  : resident
              ),
            };
          })
          .filter((account) => account.residents.length > 0),
      };
  }
}

interface PaymentsScreenProps {
  readonly republicId: string;
}

export default function PaymentsScreen({ republicId }: PaymentsScreenProps) {
  useComponentLogger("PaymentsScreen");
  const { refreshAll } = useRefresh();
  const { error, fetchAccounts, fetchAccountResidents } = useAccountData({
    republicId,
  });
  const [{ accounts: paymentAccounts, isLoading, isRefreshing }, dispatch] =
    useReducer(paymentsReducer, {
      accounts: [],
      isLoading: true,
      isRefreshing: false,
    });
  const [confirmingResidentById, setConfirmingResidentById] = useState<
    Record<string, boolean>
  >({});
  const [selectedStatus, setSelectedStatus] = useState<PaymentStatusFilter>(
    StatusPagamento.AGUARDANDO_CONFIRMACAO
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
                getMoradorStatusVisual(resident) === StatusPagamento.PAGO
            );

            if (relevantResidents.length === 0) {
              return null;
            }

            return {
              ...account,
              residents: relevantResidents,
            };
          })
        );

        const filteredAccounts = accountsWithPayments
          .filter((account): account is PaymentAccount => account !== null)
          .sort(
            (firstAccount, secondAccount) =>
              new Date(firstAccount.vencimento).getTime() -
              new Date(secondAccount.vencimento).getTime()
          );

        dispatch({ type: "LOAD_SUCCESS", accounts: filteredAccounts });
      } finally {
        dispatch({ type: "LOAD_DONE" });
      }
    },
    [fetchAccounts, fetchAccountResidents]
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
          getErrorMessage(error, "Não foi possível atualizar o pagamento.")
        );
      } finally {
        setConfirmingResidentById((previousState) => {
          const nextState = { ...previousState };
          delete nextState[residentId];
          return nextState;
        });
      }
    },
    [confirmingResidentById, refreshAll]
  );

  const filteredPaymentAccounts = useMemo(
    () =>
      paymentAccounts
        .map((account) => {
          if (selectedStatus === "todos") {
            return account;
          }

          const filteredResidents = account.residents.filter(
            (resident) => getMoradorStatusVisual(resident) === selectedStatus
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
    [paymentAccounts, selectedStatus]
  );

  const filteredResidentsCount = useMemo(
    () =>
      filteredPaymentAccounts.reduce(
        (total, account) => total + account.residents.length,
        0
      ),
    [filteredPaymentAccounts]
  );

  const subtitle = useMemo(() => {
    if (selectedStatus === StatusPagamento.PAGO) {
      if (filteredResidentsCount === 0) {
        return "Nenhum pagamento marcado como PAGO";
      }

      if (filteredResidentsCount === 1) {
        return "1 pagamento marcado como PAGO";
      }

      return `${filteredResidentsCount} pagamentos marcados como PAGO`;
    }

    if (selectedStatus === StatusPagamento.AGUARDANDO_CONFIRMACAO) {
      if (filteredResidentsCount === 0) {
        return "Nenhum pagamento aguardando confirmação";
      }

      if (filteredResidentsCount === 1) {
        return "1 pagamento aguardando confirmação";
      }

      return `${filteredResidentsCount} pagamentos aguardando confirmação`;
    }

    if (filteredResidentsCount === 0) {
      return "Nenhum pagamento encontrado";
    }

    if (filteredResidentsCount === 1) {
      return "1 pagamento encontrado";
    }

    return `${filteredResidentsCount} pagamentos encontrados`;
  }, [filteredResidentsCount, selectedStatus]);

  const statusOptions: {
    label: string;
    value: PaymentStatusFilter;
  }[] = [
    {
      label: "Pendentes",
      value: StatusPagamento.AGUARDANDO_CONFIRMACAO,
    },
    {
      label: "Pago",
      value: StatusPagamento.PAGO,
    },
    {
      label: "Todos",
      value: "todos",
    },
  ];

  let content = (
    <PendingPaymentsList
      paymentAccounts={filteredPaymentAccounts}
      confirmingResidentById={confirmingResidentById}
      isRefreshing={isRefreshing}
      onConfirmResidentPayment={handleConfirmResidentPayment}
      onRefresh={() => void loadPayments(true)}
      selectedStatus={selectedStatus}
    />
  );

  if (isLoading) {
    content = <PaymentsLoadingState />;
  } else if (error) {
    content = (
      <PaymentsErrorState
        message={error.message}
        onRetry={() => void loadPayments()}
      />
    );
  } else if (filteredPaymentAccounts.length === 0) {
    content = (
      <PaymentsEmptyState
        isRefreshing={isRefreshing}
        onRefresh={() => void loadPayments(true)}
        selectedStatus={selectedStatus}
      />
    );
  }

  return (
    <ScreenLayout key={republicId} title="Pagamentos" subtitle={subtitle}>
      <View className="flex-1 px-4 py-4">
        <View className="mb-4">
          <Text className="mb-2 text-sm font-semibold text-gray-700">
            Filtrar por status:
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {statusOptions.map((option) => {
              const selected = selectedStatus === option.value;

              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setSelectedStatus(option.value)}
                  accessibilityRole="button"
                  accessibilityLabel={`Filtrar pagamentos por ${option.label}`}
                  accessibilityState={{ selected }}
                  className={`rounded-full px-4 py-2 ${
                    selected ? "bg-teal" : "border border-teal/20 bg-white"
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      selected ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {content}
      </View>
    </ScreenLayout>
  );
}
