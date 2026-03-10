import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "@/src/components/Header";
import {
  PaymentsEmptyState,
  PaymentsErrorState,
  PaymentsLoadingState,
  PendingPaymentsList,
} from "@/src/features/accounts/components/payments";
import { useAccountData } from "@/src/features/accounts/hooks/useAccountList/useAccountData";
import {
  StatusPagamento,
} from "@/src/features/accounts/types/accountResidents.types";
import type { PendingPaymentAccount } from "@/src/features/accounts/types/payments.types";

interface PaymentsScreenProps {
  readonly republicId: string;
}

export default function PaymentsScreen({ republicId }: PaymentsScreenProps) {
  const { error, fetchAccounts, fetchAccountResidents } = useAccountData({
    republicId,
  });
  const [pendingAccounts, setPendingAccounts] = useState<
    PendingPaymentAccount[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadPendingPayments = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const accounts = await fetchAccounts();

        const accountsWithPendingPayments = await Promise.all(
          accounts.map(async (account) => {
            const residents = await fetchAccountResidents(account.id);
            const pendingResidents = residents.filter(
              (resident) =>
                resident.status === StatusPagamento.AGUARDANDO_CONFIRMACAO,
            );

            if (pendingResidents.length === 0) {
              return null;
            }

            return {
              ...account,
              pendingResidents,
            };
          }),
        );

        const filteredAccounts = accountsWithPendingPayments
          .filter(
            (account): account is PendingPaymentAccount => account !== null,
          )
          .sort(
            (firstAccount, secondAccount) =>
              new Date(firstAccount.vencimento).getTime() -
              new Date(secondAccount.vencimento).getTime(),
          );

        setPendingAccounts(filteredAccounts);
      } finally {
        if (isManualRefresh) {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [fetchAccounts, fetchAccountResidents],
  );

  useEffect(() => {
    void loadPendingPayments();
  }, [loadPendingPayments]);

  const pendingResidentsCount = useMemo(
    () =>
      pendingAccounts.reduce(
        (total, account) => total + account.pendingResidents.length,
        0,
      ),
    [pendingAccounts],
  );

  const subtitle = useMemo(() => {
    if (pendingResidentsCount === 1) {
      return "1 pagamento aguardando confirmação";
    }

    return `${pendingResidentsCount} pagamentos aguardando confirmação`;
  }, [pendingResidentsCount]);

  let content = (
    <PendingPaymentsList
      pendingAccounts={pendingAccounts}
      isRefreshing={isRefreshing}
      onRefresh={() => void loadPendingPayments(true)}
    />
  );

  if (isLoading) {
    content = <PaymentsLoadingState />;
  } else if (error) {
    content = (
      <PaymentsErrorState
        message={error.message}
        onRetry={() => void loadPendingPayments()}
      />
    );
  } else if (pendingAccounts.length === 0) {
    content = (
      <PaymentsEmptyState onRefresh={() => void loadPendingPayments(true)} />
    );
  }

  return (
    <SafeAreaView key={republicId} className="flex-1 bg-[#FAFAFA]">
      <Header title="Pagamentos" />

      <View className="flex-1 px-4 pb-4">
        <Text className="mb-4 text-sm text-gray-500">{subtitle}</Text>
        {content}
      </View>
    </SafeAreaView>
  );
}
