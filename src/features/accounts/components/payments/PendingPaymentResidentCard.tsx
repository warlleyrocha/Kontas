import { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import {
  type ContaMorador,
  StatusPagamento,
} from "@/src/features/accounts/types/accountResidents.types";
import {
  getMoradorStatusBadge,
  getMoradorStatusVisual,
} from "@/src/features/accounts/utils/accountStatus.utils";
import { formatPaymentMethodLabel } from "@/src/features/accounts/utils/paymentMethod.utils";
import { formatCurrency } from "@/src/shared/utils/formats";
import { getInitials } from "@/src/shared/utils/getInitials";
import Feather from "@expo/vector-icons/Feather";

interface PendingPaymentResidentCardProps {
  readonly accountId: string;
  readonly onConfirmResidentPayment: (
    accountId: string,
    residentId: string
  ) => Promise<void> | void;
  readonly onRefuseResidentPayment: (
    accountId: string,
    residentId: string
  ) => Promise<void> | void;
  readonly resident: ContaMorador;
}

export function PendingPaymentResidentCard({
  accountId,
  onConfirmResidentPayment,
  onRefuseResidentPayment,
  resident,
}: PendingPaymentResidentCardProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRefusing, setIsRefusing] = useState(false);
  const residentStatus = getMoradorStatusVisual(resident);
  const residentPaid = residentStatus === StatusPagamento.PAGO;
  const {
    backgroundClassName: residentStatusBadgeClass,
    textClassName: residentStatusTextClass,
    label: residentStatusLabel,
  } = getMoradorStatusBadge(residentStatus);

  return (
    <View className="rounded-3xl bg-white px-4 py-4">
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-teal/15">
              <Text className="text-sm font-semibold text-teal">
                {getInitials(resident.moradorNome)}
              </Text>
            </View>

            <View className="flex-1">
              <Text className="text-base font-semibold text-[#111827]">
                {resident.moradorNome}
              </Text>

              <Text className="mt-1 text-xs text-gray-500">
                {formatPaymentMethodLabel(resident.metodoPagamento)}
              </Text>
            </View>
          </View>
        </View>

        <View className="items-end gap-2">
          <Text className="text-sm font-semibold text-[#111827]">
            {formatCurrency(resident.valor)}
          </Text>
          <View
            className={`rounded-full px-3 py-1 ${residentStatusBadgeClass}`}
          >
            <Text
              className={`text-xs font-semibold ${residentStatusTextClass}`}
            >
              {residentStatusLabel}
            </Text>
          </View>
        </View>
      </View>

      {!residentPaid && (
        <View className="mt-4 flex-row gap-3">
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={isRefusing || isConfirming}
            onPress={async () => {
              setIsRefusing(true);
              try {
                await onRefuseResidentPayment(accountId, resident.id);
              } finally {
                setIsRefusing(false);
              }
            }}
            className={`min-h-11 flex-1 flex-row items-center border border-[#E53935] justify-center rounded-full px-4 bg-transparent ${
              isRefusing ? "opacity-50" : "opacity-100"
            }`}
          >
            {isRefusing ? (
              <ActivityIndicator size="small" color="#E53935" />
            ) : (
              <View className="flex-row items-center justify-center gap-1">
                <Feather name="x" size={16} color="#E53935" className="mr-1" />
                <Text className="text-sm font-semibold text-[#E53935]">Recusar</Text>
              </View>
              
            )}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={isConfirming || isRefusing}
            onPress={async () => {
              setIsConfirming(true);
              try {
                await onConfirmResidentPayment(accountId, resident.id);
              } finally {
                setIsConfirming(false);
              }
            }}
            className={`min-h-11 flex-1 flex-row items-center justify-center rounded-full px-4 bg-teal ${
              isConfirming ? "opacity-50" : "opacity-100"
            }`}
          >
            {isConfirming ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <View className="flex-row items-center justify-center gap-1">
                <Feather name="check" size={16} color="#FFFFFF" className="mr-1" />
              <Text className="text-sm font-semibold text-white">
                Confirmar
              </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
