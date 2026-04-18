import Ionicons from "@expo/vector-icons/Ionicons";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useRefresh } from "@/src/shared/contexts/RefreshContext";
import type { ResidentResponse } from "@/src/shared/types/resident.types";
import { MoradorRow } from "./MoradorRow";
import { ResumoCard } from "./ResumoCard";
import { useResumeTab } from "./useResumeTab";

interface Props {
  residents: ResidentResponse[];
  republicId: string;
}

export const ResumeTab = ({ residents, republicId }: Props) => {
  const { refreshing, onRefresh } = useRefresh();
  const {
    contas,
    isLoadingContas,
    dividas,
    isLoadingDividas,
    totalValor,
    totalPago,
    totalPendente,
    quantidadePagas,
    quantidadePendentes,
  } = useResumeTab({ residents, republicId });

  const resumoCards = [
    {
      label: "Total de Contas",
      value: totalValor,
      icon: <Ionicons name="cash-outline" size={20} color="#337176" />,
      description: `${contas.length} contas registradas`,
      color: "#337176",
    },
    {
      label: "Contas Pagas",
      value: totalPago,
      icon: (
        <Ionicons name="checkmark-circle-outline" size={20} color="#16a34a" />
      ),
      description: `${quantidadePagas} de ${contas.length} pagas`,
      color: "#16a34a",
    },
    {
      label: "Pendentes",
      value: totalPendente,
      icon: <Ionicons name="alert-circle-outline" size={20} color="#C87223" />,
      description: `${quantidadePendentes} contas a pagar`,
      color: "#C87223",
    },
  ];

  return (
    <ScrollView
      contentContainerStyle={{ paddingVertical: 12, paddingBottom: 50 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="flex-row flex-wrap justify-between">
        {resumoCards.map((card) => (
          <ResumoCard key={card.label} {...card} isLoading={isLoadingContas} />
        ))}
      </View>

      <View className="rounded-lg border border-teal/10 bg-white p-4 shadow-sm">
        <View className="mb-3">
          <Text className="text-base font-semibold">Dívidas por Morador</Text>
          <Text className="text-sm text-gray-500">
            Valores pendentes de cada morador
          </Text>
        </View>

        {isLoadingDividas ? (
          <ActivityIndicator size="small" color="#337176" />
        ) : (
          <View className="gap-3 space-y-3">
            {residents.map((morador) => (
              <MoradorRow
                key={morador.id}
                morador={morador}
                valor={dividas[morador.id] ?? 0}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};
