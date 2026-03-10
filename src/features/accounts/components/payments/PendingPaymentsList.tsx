import React from "react";
import { RefreshControl, ScrollView } from "react-native";

import type { PendingPaymentAccount } from "@/src/features/accounts/types/payments.types";

import { PendingPaymentCard } from "./PendingPaymentCard";

interface PendingPaymentsListProps {
  readonly pendingAccounts: PendingPaymentAccount[];
  readonly isRefreshing: boolean;
  readonly onRefresh: () => void;
}

export function PendingPaymentsList({
  pendingAccounts,
  isRefreshing,
  onRefresh,
}: PendingPaymentsListProps) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {pendingAccounts.map((account) => (
        <PendingPaymentCard key={account.id} account={account} />
      ))}
    </ScrollView>
  );
}
