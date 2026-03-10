import { Text, TouchableOpacity, View } from "react-native";

import {
  ContaMorador,
  StatusPagamento,
} from "@/src/features/accounts/types/accountResidents.types";
import { AccountStatusIcon } from "../shared/AccountStatusIcon";
import {
  getMoradorStatusBadge,
  getMoradorStatusIcon,
  getMoradorStatusVisual,
} from "../../utils/accountStatus.utils";

interface AccountResidentRowProps {
  readonly accountId: string;
  readonly morador: ContaMorador;
  readonly isLastItem: boolean;
  readonly isUpdatingMorador: boolean;
  readonly currentResidentId: string | null;
  readonly onConfirmResidentPayment?: (
    accountId: string,
    accountResidentId: string
  ) => Promise<void> | void;
}

export function AccountResidentRow({
  accountId,
  morador,
  isLastItem,
  isUpdatingMorador,
  currentResidentId,
  onConfirmResidentPayment,
}: AccountResidentRowProps) {
  const moradorStatusVisual = getMoradorStatusVisual(morador);
  const moradorPago = moradorStatusVisual === StatusPagamento.PAGO;
  const moradorAguardando =
    moradorStatusVisual === StatusPagamento.AGUARDANDO_CONFIRMACAO;
  const canConfirmOwnPayment = morador.moradorId === currentResidentId;
  const {
    backgroundClassName: moradorStatusBadgeClass,
    textClassName: moradorStatusTextClass,
    label: moradorStatusLabel,
  } = getMoradorStatusBadge(moradorStatusVisual);
  const moradorStatusIcon = getMoradorStatusIcon(moradorStatusVisual);

  return (
    <View
      className={`flex-row items-center justify-between px-4 py-3 ${
        isLastItem ? "" : "border-b border-gray-200"
      }`}
    >
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();

          if (
            moradorPago ||
            moradorAguardando ||
            isUpdatingMorador ||
            !canConfirmOwnPayment ||
            !onConfirmResidentPayment
          ) {
            return;
          }

          void onConfirmResidentPayment(accountId, morador.id);
        }}
        disabled={
          moradorPago ||
          moradorAguardando ||
          isUpdatingMorador ||
          !canConfirmOwnPayment ||
          !onConfirmResidentPayment
        }
        className="flex-1 flex-row items-center gap-3"
      >
        <AccountStatusIcon
          icon={moradorStatusIcon}
          size={20}
          isLoading={isUpdatingMorador}
        />
        <View className="flex-1">
          <Text
            className={`text-sm font-medium ${
              moradorPago ? "text-gray-400 line-through" : "text-gray-700"
            }`}
          >
            {morador.moradorNome}
          </Text>
          {morador.valor > 0 && (
            <Text className="mt-1 text-xs text-gray-500">
              R$ {morador.valor.toFixed(2).replace(".", ",")}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      <View
        className={`flex-row items-center gap-1 rounded-md px-2 py-1 ${moradorStatusBadgeClass}`}
      >
        <Text className={`text-xs font-medium ${moradorStatusTextClass}`}>
          {moradorStatusLabel}
        </Text>
      </View>
    </View>
  );
}
