import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { ContaMorador } from "@/src/features/accounts/types/accountResidents.types";
import { accountCopyFeedback } from "@/src/shared/constants/pixCopyFeedback";
import { useCopyFeedback } from "@/src/shared/hooks/useCopyFeedback";
import { formatBRL } from "@/src/shared/utils/formats";
import { Conta, MetodoPagamento, StatusConta } from "../../types/account.types";
import {
  getContaStatusIcon,
  getContaStatusVisual,
  parseContaVencimento,
} from "../../utils/accountStatus.utils";
import { normalizeMetodoPagamento } from "../../utils/paymentMethod.utils";
import { type CardPosition } from "../AccountContextMenu";
import { AccountStatusIcon } from "../shared/AccountStatusIcon";
import { AccountResidentsContent } from "./AccountResidentsContent";

interface AccountCardProps {
  conta: Conta;
  criadoPorNome: string;
  expanded: boolean;
  onToggleExpand: () => void;
  moradores: ContaMorador[];
  isLoadingMoradores: boolean;
  updatingResidentById: Record<string, boolean>;
  currentResidentId: string | null;
  onLongPress?: (position: CardPosition) => void;
  onConfirmResidentPayment?: (
    accountId: string,
    accountResidentId: string
  ) => Promise<void> | void;
  onPatch?: (
    accountId: string,
    metodoPagamento: MetodoPagamento
  ) => Promise<void> | void;
  onCopyPix?: (conta: Conta) => boolean | Promise<boolean>;
  readonly hasError?: boolean;
}

export const AccountCard = ({
  conta,
  criadoPorNome,
  expanded,
  onToggleExpand,
  moradores,
  isLoadingMoradores,
  updatingResidentById,
  currentResidentId,
  onLongPress,
  onConfirmResidentPayment,
  onPatch,
  onCopyPix,
  hasError,
}: AccountCardProps) => {
  const cardRef = useRef<View>(null);
  const [isPatching, setIsPatching] = useState(false);

  const { handleCopy: handleCopyPix, copyFeedback } = useCopyFeedback(
    () => onCopyPix?.(conta) ?? false,
    accountCopyFeedback
  );

  const vencimento = parseContaVencimento(conta.vencimento);
  const contaStatusVisual = getContaStatusVisual(conta);
  const contaStatusIcon = getContaStatusIcon(contaStatusVisual);
  const vencimentoLabel = vencimento
    ? vencimento.toLocaleDateString("pt-BR")
    : "Data inválida";

  const paga = contaStatusVisual === StatusConta.PAGA;
  const vencida = contaStatusVisual === StatusConta.ATRASADA;

  const handleLongPress = () => {
    cardRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
      onLongPress?.({ x: pageX, y: pageY, width, height });
    });
  };

  const handlePatchAccount = async () => {
    if (paga || isPatching || !onPatch) {
      return;
    }

    setIsPatching(true);
    try {
      const metodoPagamento = normalizeMetodoPagamento(conta.metodoPagamento);
      await onPatch(conta.id, metodoPagamento);
    } catch {
      // erro já tratado em onPatch
    }

    setIsPatching(false);
  };

  return (
    <View ref={cardRef}>
      <TouchableOpacity
        onPress={() => {}}
        onLongPress={handleLongPress}
        delayLongPress={400}
        activeOpacity={0.7}
      >
        <View
          className={`mb-3 rounded-lg bg-white shadow-sm ${
            vencida ? "border border-orange-300 bg-orange-50" : ""
          }`}
        >
          {/* HEADER: Status + Descrição + Valor */}
          <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
            <TouchableOpacity
              className="flex-row items-center gap-2"
              disabled={paga || isPatching}
              onPress={async (e) => {
                e.stopPropagation();
                await handlePatchAccount();
              }}
            >
              <AccountStatusIcon
                icon={contaStatusIcon}
                size={24}
                isLoading={isPatching}
              />
              <Text
                className={`text-base font-semibold ${
                  paga ? "text-gray-400 line-through" : "text-gray-800"
                }`}
              >
                {conta.descricao}
              </Text>
            </TouchableOpacity>

            <Text className="ml-2 font-bold text-teal">
              R$ {formatBRL(conta.valor)}
            </Text>
          </View>

          {/* INFO SECUNDÁRIAS: Data + Responsável */}
          <View className="border-b border-gray-100 px-4 py-3">
            <View className="flex-row items-center justify-between gap-4">
              {/* Responsável */}
              <View className="rounded-md border border-teal/40 px-2 py-1">
                <Text className="text-xs text-teal">
                  Responsável: {criadoPorNome}
                </Text>
              </View>

              {/* Data */}
              <View className="flex-row items-center gap-1">
                <Ionicons name="calendar-outline" size={16} color="#337176" />
                <Text className="text-sm text-gray-600">{vencimentoLabel}</Text>
              </View>
            </View>
          </View>

          {/* MORADORES - DROPDOWN */}
          <View className="border-b border-gray-100">
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
              className="flex-row items-center justify-between px-4 py-3"
            >
              <View className="flex-row items-center gap-2">
                <Ionicons name="people-outline" size={18} color="#337176" />
                <Text className="font-semibold text-gray-700">Moradores</Text>
                <View className="rounded-full bg-teal/15 px-2 py-0.5">
                  <Text className="text-xs font-semibold text-teal">
                    {isLoadingMoradores ? "..." : moradores.length}
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons
                name={expanded ? "chevron-up" : "chevron-down"}
                size={24}
                color="#337176"
              />
            </TouchableOpacity>

            {/* CONTEÚDO: Lista de Moradores */}
            {expanded && (
              <View className="border-t border-teal/10 bg-teal/5">
                <AccountResidentsContent
                  accountId={conta.id}
                  moradores={moradores}
                  isLoadingMoradores={isLoadingMoradores}
                  updatingResidentById={updatingResidentById}
                  currentResidentId={currentResidentId}
                  onConfirmResidentPayment={onConfirmResidentPayment}
                  hasError={hasError}
                />
              </View>
            )}
          </View>

          {/* FOOTER: Ações */}
          <View className="flex-row gap-2 px-4 py-3">
            {/* Copiar PIX */}
            {!paga && (
              <TouchableOpacity
                onPress={handleCopyPix}
                accessibilityRole="button"
                accessibilityLabel={copyFeedback.accessibilityLabel}
                className="flex-1 flex-row items-center justify-center rounded-md border border-teal/40 py-2"
              >
                {copyFeedback.icon}
                <Text className="ml-2 text-sm text-gray-700">
                  {copyFeedback.text}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default AccountCard;
