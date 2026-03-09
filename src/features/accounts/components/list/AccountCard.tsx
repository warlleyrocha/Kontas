import { View, TouchableOpacity, Text } from "react-native";
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useState } from "react";

import { AccountResidentsContent } from "./AccountResidentsContent";
import { AccountStatusIcon } from "../shared/AccountStatusIcon";
import { Conta, MetodoPagamento, StatusConta } from "../../types/account.types";
import { ContaMorador } from "@/src/features/accounts/types/accountResidents.types";
import {
  getContaStatusIcon,
  getContaStatusVisual,
  parseContaVencimento,
} from "../../utils/accountStatus.utils";

interface AccountCardProps {
  conta: Conta;
  criadoPorNome: string;
  expanded: boolean;
  onToggleExpand: () => void;
  moradores: ContaMorador[];
  isLoadingMoradores: boolean;
  updatingResidentById: Record<string, boolean>;
  onConfirmResidentPayment?: (
    accountId: string,
    accountResidentId: string,
  ) => Promise<void> | void;
  onDelete?: (accountId: string) => Promise<void> | void;
  onPatch?: (
    accountId: string,
    metodoPagamento: MetodoPagamento,
  ) => Promise<void> | void;
}

const normalizeMetodoPagamento = (metodoPagamento: string): MetodoPagamento => {
  const normalized = metodoPagamento
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();

  if (normalized === MetodoPagamento.CARTAO) {
    return MetodoPagamento.CARTAO;
  }

  if (normalized === MetodoPagamento.DINHEIRO) {
    return MetodoPagamento.DINHEIRO;
  }

  return MetodoPagamento.PIX;
};

export const AccountCard = ({
  conta,
  criadoPorNome,
  expanded,
  onToggleExpand,
  moradores,
  isLoadingMoradores,
  updatingResidentById,
  onConfirmResidentPayment,
  onDelete,
  onPatch,
}: AccountCardProps) => {
  const [isPatching, setIsPatching] = useState(false);
  const vencimento = parseContaVencimento(conta.vencimento);
  const contaStatusVisual = getContaStatusVisual(conta);
  const contaStatusIcon = getContaStatusIcon(contaStatusVisual);
  const vencimentoLabel = vencimento
    ? vencimento.toLocaleDateString("pt-BR")
    : "Data inválida";

  const paga = contaStatusVisual === StatusConta.PAGO;
  const vencida = contaStatusVisual === StatusConta.ATRASADO;

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
    <TouchableOpacity
      onPress={() => console.log("Editar conta", conta.id)}
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
            className="flex-1 flex-row items-center gap-2"
            disabled={paga || isPatching}
            onPress={(e) => {
              e.stopPropagation();
              void handlePatchAccount();
            }}
          >
            <AccountStatusIcon
              icon={contaStatusIcon}
              size={24}
              isLoading={isPatching}
            />
            <Text
              className={`flex-1 text-base font-semibold ${
                paga ? "text-gray-400 line-through" : "text-gray-800"
              }`}
            >
              {conta.descricao}
            </Text>
          </TouchableOpacity>

          <Text className="ml-2 font-bold text-indigo-600">
            R$ {conta.valor.toFixed(2)}
          </Text>
        </View>

        {/* INFO SECUNDÁRIAS: Data + Responsável */}
        <View className="border-b border-gray-100 px-4 py-3">
          <View className="flex-row items-center justify-between gap-4">
            {/* Responsável */}
            <View className="rounded-md border border-indigo-600 px-2 py-1">
              <Text className="text-xs text-indigo-600">
                Responsável: {criadoPorNome}
              </Text>
            </View>

            {/* Data */}
            <View className="flex-row items-center gap-1">
              <Ionicons name="calendar-outline" size={16} color="#4b5563" />
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
              <Ionicons name="people-outline" size={18} color="#4b5563" />
              <Text className="font-semibold text-gray-700">Moradores</Text>
              <View className="rounded-full bg-indigo-100 px-2 py-0.5">
                <Text className="text-xs font-semibold text-indigo-600">
                  {isLoadingMoradores ? "..." : moradores.length}
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons
              name={expanded ? "chevron-up" : "chevron-down"}
              size={24}
              color="#6b7280"
            />
          </TouchableOpacity>

          {/* CONTEÚDO: Lista de Moradores */}
          {expanded && (
            <View className="border-t border-gray-100 bg-gray-50">
              <AccountResidentsContent
                accountId={conta.id}
                moradores={moradores}
                isLoadingMoradores={isLoadingMoradores}
                updatingResidentById={updatingResidentById}
                onConfirmResidentPayment={onConfirmResidentPayment}
              />
            </View>
          )}
        </View>

        {/* FOOTER: Ações */}
        <View className="flex-row gap-2 px-4 py-3">
          {/* Copiar PIX */}
          {!paga && (
            <TouchableOpacity
              onPress={() => console.log("Copiar PIX")}
              className="flex-1 flex-row items-center justify-center rounded-md border border-indigo-600 py-2"
            >
              <Feather name="copy" size={16} color="#4b5563" />
              <Text className="ml-2 text-sm text-gray-700">Copiar PIX</Text>
            </TouchableOpacity>
          )}

          {/* Deletar */}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              void onDelete?.(conta.id);
            }}
            className="flex-row items-center justify-center rounded-md bg-red-50 px-4 py-2"
          >
            <Feather name="trash-2" size={16} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default AccountCard;
