import React from "react";
import { Text, View } from "react-native";

import type { PendingPaymentAccount } from "@/src/features/accounts/types/payments.types";
import { formatDate } from "@/src/utils/formats";

import { PendingPaymentResidentCard } from "./PendingPaymentResidentCard";

interface PendingPaymentCardProps {
  readonly account: PendingPaymentAccount;
}

export function PendingPaymentCard({ account }: PendingPaymentCardProps) {
  return (
    <View className="mb-4 rounded-2xl border border-amber-100 bg-white p-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-800">
            {account.descricao}
          </Text>
          <Text className="mt-1 text-sm text-gray-500">
            Vence em {formatDate(account.vencimento)}
          </Text>
        </View>

        <View className="rounded-full bg-amber-50 px-3 py-1">
          <Text className="text-xs font-semibold text-amber-700">
            {account.pendingResidents.length} aguardando
          </Text>
        </View>
      </View>

      <View className="mt-4 gap-2">
        {account.pendingResidents.map((resident) => (
          <PendingPaymentResidentCard key={resident.id} resident={resident} />
        ))}
      </View>
    </View>
  );
}
