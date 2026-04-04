import { ActivityIndicator, Text, View } from "react-native";

import type { ContaMorador } from "../../types/accountResidents.types";
import { AccountResidentRow } from "./AccountResidentRow";

interface AccountResidentsContentProps {
  readonly accountId: string;
  readonly moradores: ContaMorador[];
  readonly isLoadingMoradores: boolean;
  readonly hasError?: boolean;
  readonly updatingResidentById: Record<string, boolean>;
  readonly currentResidentId: string | null;
  readonly onConfirmResidentPayment?: (
    accountId: string,
    accountResidentId: string
  ) => Promise<void> | void;
}

export function AccountResidentsContent({
  accountId,
  moradores,
  isLoadingMoradores,
  hasError = false,
  updatingResidentById,
  currentResidentId,
  onConfirmResidentPayment,
}: AccountResidentsContentProps) {
  if (isLoadingMoradores) {
    return (
      <View className="items-center justify-center py-6">
        <ActivityIndicator size="small" color="#4b5563" />
        <Text className="mt-2 text-sm text-gray-500">
          Carregando moradores...
        </Text>
      </View>
    );
  }

  if (hasError && moradores.length === 0) {
    return (
      <View className="items-center justify-center py-6">
        <Text className="text-sm text-red-500">
          Erro ao carregar moradores. Tente novamente.
        </Text>
      </View>
    );
  }

  if (moradores.length === 0) {
    return (
      <View className="items-center justify-center py-6">
        <Text className="text-sm text-gray-500">Nenhum morador disponível</Text>
      </View>
    );
  }

  return (
    <>
      {moradores.map((morador, index) => (
        <AccountResidentRow
          key={morador.id}
          accountId={accountId}
          morador={morador}
          isLastItem={index === moradores.length - 1}
          isUpdatingMorador={Boolean(updatingResidentById[morador.id])}
          currentResidentId={currentResidentId}
          onConfirmResidentPayment={onConfirmResidentPayment}
        />
      ))}
    </>
  );
}
