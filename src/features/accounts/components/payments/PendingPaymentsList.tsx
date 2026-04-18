import { RefreshControl, ScrollView } from "react-native";

import type {
  PaymentAccount,
  PaymentStatusFilter,
} from "@/src/features/accounts/types/payments.types";

import { PendingPaymentCard } from "./PendingPaymentCard";

interface PendingPaymentsListProps {
  readonly paymentAccounts: PaymentAccount[];
  readonly isRefreshing: boolean;
  readonly onConfirmResidentPayment: (
    accountId: string,
    residentId: string
  ) => Promise<void> | void;
  readonly onRefuseResidentPayment: (
    accountId: string,
    residentId: string
  ) => Promise<void> | void;
  readonly onRefresh: () => void;
  readonly selectedStatus: PaymentStatusFilter;
}

export function PendingPaymentsList({
  paymentAccounts,
  isRefreshing,
  onConfirmResidentPayment,
  onRefuseResidentPayment,
  onRefresh,
  selectedStatus,
}: PendingPaymentsListProps) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {paymentAccounts.map((account) => (
        <PendingPaymentCard
          key={account.id}
          account={account}
          onConfirmResidentPayment={onConfirmResidentPayment}
          onRefuseResidentPayment={onRefuseResidentPayment}
          selectedStatus={selectedStatus}
        />
      ))}
    </ScrollView>
  );
}
