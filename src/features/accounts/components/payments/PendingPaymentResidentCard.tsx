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

interface PendingPaymentResidentCardProps {
  readonly accountId: string;
  readonly isConfirming: boolean;
  readonly isRefusing: boolean;
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
  isConfirming,
  isRefusing,
  onConfirmResidentPayment,
  onRefuseResidentPayment,
  resident,
}: PendingPaymentResidentCardProps) {
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
              await onRefuseResidentPayment(accountId, resident.id);
            }}
            className={`min-h-11 flex-1 flex-row items-center justify-center rounded-full px-4 ${
              isRefusing || isConfirming ? "bg-gray-300" : "bg-red-500"
            }`}
          >
            {isRefusing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-sm font-semibold text-white">Recusar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={isConfirming || isRefusing}
            onPress={async () => {
              await onConfirmResidentPayment(accountId, resident.id);
            }}
            className={`min-h-11 flex-1 flex-row items-center justify-center rounded-full px-4 ${
              isConfirming || isRefusing ? "bg-gray-300" : "bg-teal-dark"
            }`}
          >
            {isConfirming ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-sm font-semibold text-white">
                Confirmar
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
