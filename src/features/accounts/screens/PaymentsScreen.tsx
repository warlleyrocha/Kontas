import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "@/src/components/Header";
import {
  PaymentsEmptyState,
  PaymentsErrorState,
  PaymentsLoadingState,
  PendingPaymentsList,
} from "@/src/features/accounts/components/payments";
import { useAccountData } from "@/src/features/accounts/hooks/useAccountList/useAccountData";
import { StatusPagamento } from "@/src/features/accounts/types/accountResidents.types";
import type {
  PaymentAccount,
  PaymentStatusFilter,
} from "@/src/features/accounts/types/payments.types";
import { accountResidentsService } from "@/src/features/accounts/services/account-residents.service";
import { getMoradorStatusVisual } from "@/src/features/accounts/utils/accountStatus.utils";
import { getErrorMessage } from "@/src/services/httpError";
import { showToast } from "@/src/utils/showToast";

interface PaymentsScreenProps {
  readonly republicId: string;
}

export default function PaymentsScreen({ republicId }: PaymentsScreenProps) {
  const { error, fetchAccounts, fetchAccountResidents } = useAccountData({
    republicId,
  });
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [confirmingResidentById, setConfirmingResidentById] = useState<
    Record<string, boolean>
  >({});
  const [selectedStatus, setSelectedStatus] = useState<PaymentStatusFilter>(
    StatusPagamento.AGUARDANDO_CONFIRMACAO
  );

  const loadPayments = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

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

        setPaymentAccounts(filteredAccounts);
      } finally {
        if (isManualRefresh) {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
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

        setPaymentAccounts((previousState) =>
          previousState
            .map((account) => {
              if (account.id !== accountId) {
                return account;
              }

              return {
                ...account,
                residents: account.residents.map((resident) =>
                  resident.id === residentId
                    ? {
                        ...resident,
                        pagoEm: new Date().toISOString(),
                        status: StatusPagamento.PAGO,
                      }
                    : resident
                ),
              };
            })
            .filter((account) => account.residents.length > 0)
        );

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
    [confirmingResidentById]
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
        onRefresh={() => void loadPayments(true)}
        selectedStatus={selectedStatus}
      />
    );
  }

  return (
    <SafeAreaView key={republicId} className="flex-1 bg-[#FAFAFA]">
      <Header title="Pagamentos" />

      <View className="flex-1 px-4 pb-4">
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
                  className={`rounded-full px-4 py-2 ${
                    selected
                      ? "bg-indigo-600"
                      : "border border-gray-300 bg-white"
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
        <Text className="mb-4 text-sm text-gray-500">{subtitle}</Text>
        {content}
      </View>
    </SafeAreaView>
  );
}
