import React from "react";

import { EmptyState } from "@/src/components/EmptyState";

interface PaymentsEmptyStateProps {
  readonly onRefresh: () => void;
}

export function PaymentsEmptyState({
  onRefresh,
}: PaymentsEmptyStateProps) {
  return (
    <EmptyState
      icon="wallet-outline"
      iconColor="#d97706"
      bgColor="bg-amber-50"
      title="Nada para confirmar"
      description="Nenhum pagamento enviado por moradores está aguardando confirmação no momento."
      buttonText="Atualizar"
      onPress={onRefresh}
      containerClassName="px-0"
    />
  );
}
