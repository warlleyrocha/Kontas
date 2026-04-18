import Feather from "@expo/vector-icons/Feather";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { StatusPagamento } from "@/src/features/accounts/types/accountResidents.types";
import type {
  PaymentAccount,
  PaymentStatusFilter,
} from "@/src/features/accounts/types/payments.types";
import { formatCurrency, formatDate } from "@/src/shared/utils/formats";

import { PendingPaymentResidentCard } from "./PendingPaymentResidentCard";

interface PendingPaymentCardProps {
  readonly account: PaymentAccount;
  readonly onConfirmResidentPayment: (
    accountId: string,
    residentId: string
  ) => Promise<void> | void;
  readonly onRefuseResidentPayment: (
    accountId: string,
    residentId: string
  ) => Promise<void> | void;
  readonly selectedStatus: PaymentStatusFilter;
}

function getResidentsLabel(total: number) {
  if (total === 1) {
    return "1 morador";
  }

  return `${total} moradores`;
}

function getSectionTitle(selectedStatus: PaymentStatusFilter) {
  if (selectedStatus === StatusPagamento.PAGO) {
    return "Pagamentos confirmados";
  }

  if (selectedStatus === StatusPagamento.AGUARDANDO_CONFIRMACAO) {
    return "Aguardando confirmação do admin";
  }

  return "Pagamentos por morador";
}

export function PendingPaymentCard({
  account,
  onConfirmResidentPayment,
  onRefuseResidentPayment,
  selectedStatus,
}: PendingPaymentCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View className="mb-4 rounded-3xl border border-teal/10 bg-white p-5">
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setExpanded((previousState) => !previousState)}
      >
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <Text className="text-xs font-semibold uppercase tracking-wide text-teal-dark/60">
              Pagamento
            </Text>
            <Text className="mt-2 text-xl font-semibold text-[#111827]">
              {account.descricao}
            </Text>
            <View className="mt-4 flex-row flex-wrap gap-2">
              <View className="flex-row items-center gap-2 rounded-full bg-teal/5 px-3 py-2">
                <Feather name="calendar" size={14} color="#337176" />
                <Text className="text-xs font-medium text-gray-600">
                  Vence em {formatDate(account.vencimento)}
                </Text>
              </View>
            </View>
          </View>

          <View className="items-end rounded-3xl bg-teal/5 px-4 py-3">
            <Text className="text-xs font-medium text-gray-400">
              Valor total
            </Text>
            <Text className="mt-1 text-lg font-semibold text-[#111827]">
              {formatCurrency(account.valor)}
            </Text>
            <Text className="mt-2 text-xs font-medium text-gray-500">
              {getResidentsLabel(account.residents.length)}
            </Text>
          </View>
        </View>

        <View className="mt-5 flex-row items-center justify-between rounded-full bg-teal/5 px-4 py-3">
          <Text className="text-sm font-medium text-gray-600">
            {expanded ? "Ocultar detalhes" : "Ver detalhes do pagamento"}
          </Text>
          <Feather
            name={expanded ? "chevron-up" : "chevron-down"}
            size={18}
            color="#337176"
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View className="mt-4 rounded-3xl bg-teal/5 p-3">
          <Text className="px-1 text-xs font-medium uppercase tracking-wide text-teal-dark/60">
            {getSectionTitle(selectedStatus)}
          </Text>

          <View className="mt-3 gap-3">
            {account.residents.map((resident) => (
              <PendingPaymentResidentCard
                key={resident.id}
                accountId={account.id}
                resident={resident}
                onConfirmResidentPayment={onConfirmResidentPayment}
                onRefuseResidentPayment={onRefuseResidentPayment}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
