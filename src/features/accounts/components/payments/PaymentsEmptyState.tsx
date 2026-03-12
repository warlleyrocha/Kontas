import React from "react";

import { EmptyState } from "@/src/shared/components/EmptyState";
import { StatusPagamento } from "@/src/features/accounts/types/accountResidents.types";
import type { PaymentStatusFilter } from "@/src/features/accounts/types/payments.types";

interface PaymentsEmptyStateProps {
  readonly onRefresh: () => void;
  readonly selectedStatus: PaymentStatusFilter;
}

function getEmptyStateContent(selectedStatus: PaymentStatusFilter) {
  if (selectedStatus === StatusPagamento.PAGO) {
    return {
      bgColor: "bg-green-50",
      description: "Nenhum pagamento foi confirmado como PAGO no momento.",
      iconColor: "#16a34a",
      title: "Nenhum pagamento pago",
    };
  }

  if (selectedStatus === StatusPagamento.AGUARDANDO_CONFIRMACAO) {
    return {
      bgColor: "bg-amber-50",
      description:
        "Nenhum pagamento enviado por moradores está aguardando confirmação no momento.",
      iconColor: "#d97706",
      title: "Nada para confirmar",
    };
  }

  return {
    bgColor: "bg-slate-100",
    description:
      "Não há pagamentos com status PAGO ou aguardando confirmação no momento.",
    iconColor: "#475569",
    title: "Nenhum pagamento encontrado",
  };
}

export function PaymentsEmptyState({
  onRefresh,
  selectedStatus,
}: PaymentsEmptyStateProps) {
  const { bgColor, description, iconColor, title } =
    getEmptyStateContent(selectedStatus);

  return (
    <EmptyState
      icon="wallet-outline"
      iconColor={iconColor}
      bgColor={bgColor}
      title={title}
      description={description}
      buttonText="Atualizar"
      onPress={onRefresh}
      containerClassName="px-0"
    />
  );
}
