import { Text, View } from "react-native";
import type { ResidentResponse } from "@/src/shared/types/resident.types";

interface MoradorRowProps {
  morador: ResidentResponse;
  valor: number;
}

export const MoradorRow = ({ morador, valor }: MoradorRowProps) => {
  const isPendente = valor > 0;
  const valorColor = isPendente ? "text-orange-600" : "text-green-600";
  const borderColor = isPendente ? "border-orange-600" : "border-green-600";

  return (
    <View className="flex-row items-center justify-between rounded-lg bg-gray-50 p-4">
      <View>
        <Text className="text-base">{morador.nome}</Text>
        {morador.chavePix ? (
          <Text className="text-sm text-gray-500">PIX: {morador.chavePix}</Text>
        ) : null}
      </View>

      <View className="items-end">
        <Text className={`font-semibold ${valorColor}`}>
          R$ {valor.toFixed(2)}
        </Text>
        <View className={`mt-1 rounded-md border px-2 py-1 ${borderColor}`}>
          <Text className={`text-sm ${valorColor}`}>
            {isPendente ? "Pendente" : "Em dia"}
          </Text>
        </View>
      </View>
    </View>
  );
};
