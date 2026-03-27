import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import {
  PaymentsEmptyState,
  PaymentsErrorState,
  PaymentsLoadingState,
  PendingPaymentsList,
} from "@/src/features/accounts/components/payments";
import { ScreenLayout } from "@/src/shared/components/ScreenLayout";

import { usePaymentsScreen } from "../hooks/usePayments";

interface PaymentsScreenProps {
  readonly republicId: string;
}

export default function PaymentsScreen({ republicId }: PaymentsScreenProps) {
  const {
    error,
    isLoading,
    isRefreshing,
    filteredPaymentAccounts,
    confirmingResidentById,
    refusingResidentById,
    selectedStatus,
    subtitle,
    statusOptions,
    loadPayments,
    handleConfirmResidentPayment,
    handleRefuseResidentPayment,
    setSelectedStatus,
  } = usePaymentsScreen({ republicId });

  let content = (
    <PendingPaymentsList
      paymentAccounts={filteredPaymentAccounts}
      confirmingResidentById={confirmingResidentById}
      refusingResidentById={refusingResidentById}
      isRefreshing={isRefreshing}
      onConfirmResidentPayment={handleConfirmResidentPayment}
      onRefuseResidentPayment={handleRefuseResidentPayment}
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
