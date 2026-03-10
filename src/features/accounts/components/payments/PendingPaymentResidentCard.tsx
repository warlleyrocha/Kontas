import React from "react";
import { Text, View } from "react-native";

import type { ContaMorador } from "@/src/features/accounts/types/accountResidents.types";

interface PendingPaymentResidentCardProps {
  readonly resident: ContaMorador;
}

function formatCurrency(value: number) {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

export function PendingPaymentResidentCard({
  resident,
}: PendingPaymentResidentCardProps) {
  return (
    <View className="rounded-xl bg-amber-50/60 px-3 py-3">
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1">
          <Text className="text-sm font-medium text-gray-800">
            {resident.moradorNome}
          </Text>

          <Text className="mt-1 text-xs text-gray-500">
            {resident.metodoPagamento
              ? `Método: ${resident.metodoPagamento}`
              : "Pagamento enviado para confirmação"}
          </Text>
        </View>

        <Text className="text-sm font-semibold text-gray-800">
          {formatCurrency(resident.valor)}
        </Text>
      </View>
    </View>
  );
}
