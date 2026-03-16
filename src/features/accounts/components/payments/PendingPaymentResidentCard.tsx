import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import {
  StatusPagamento,
  type ContaMorador,
} from "@/src/features/accounts/types/accountResidents.types";
import {
  getMoradorStatusBadge,
  getMoradorStatusVisual,
} from "@/src/features/accounts/utils/accountStatus.utils";

interface PendingPaymentResidentCardProps {
  readonly accountId: string;
  readonly isConfirming: boolean;
  readonly onConfirmResidentPayment: (
    accountId: string,
    residentId: string
  ) => Promise<void> | void;
  readonly resident: ContaMorador;
}

function formatCurrency(value: number) {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatPaymentMethod(method: string | null) {
  if (!method) {
    return "Pagamento enviado para confirmação";
  }

  const normalized = method
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();

  if (normalized === "CARTAO") {
    return "Via Cartão";
  }

  if (normalized === "DINHEIRO") {
    return "Via Dinheiro";
  }

  return `Via ${normalized}`;
}

export function PendingPaymentResidentCard({
  accountId,
  isConfirming,
  onConfirmResidentPayment,
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
            <View className="h-11 w-11 items-center justify-center rounded-full bg-[#F2F2F7]">
              <Text className="text-sm font-semibold text-[#111827]">
                {getInitials(resident.moradorNome)}
              </Text>
            </View>

            <View className="flex-1">
              <Text className="text-base font-semibold text-[#111827]">
                {resident.moradorNome}
              </Text>

              <Text className="mt-1 text-xs text-gray-500">
                {formatPaymentMethod(resident.metodoPagamento)}
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
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={isConfirming}
          onPress={() => void onConfirmResidentPayment(accountId, resident.id)}
          className={`mt-4 min-h-11 flex-row items-center justify-center rounded-full px-4 ${
            isConfirming ? "bg-[#D1D5DB]" : "bg-[#111827]"
          }`}
        >
          {isConfirming ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text className="text-sm font-semibold text-white">
              Marcar como PAGO
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}
