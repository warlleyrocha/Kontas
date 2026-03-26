import { Text, View } from "react-native";
import { formatBRL } from "@/src/shared/utils/formats";
import type { ResidentResponse } from "@/src/shared/types/resident.types";

interface MoradorRowProps {
  morador: ResidentResponse;
  valor: number;
}

export const MoradorRow = ({ morador, valor }: MoradorRowProps) => {
  const isPendente = valor > 0;
  const valorColor = isPendente ? "text-brand-orange" : "text-green-600";
  const borderColor = isPendente ? "border-brand-orange" : "border-green-600";

  return (
    <View className="flex-row items-center justify-between rounded-lg bg-teal/5 p-4">
      <View>
        <Text className="text-base">{morador.nome}</Text>
        {morador.chavePix ? (
          <Text className="text-sm text-gray-500">PIX: {morador.chavePix}</Text>
        ) : null}
      </View>

      <View className="items-end">
        <Text className={`font-semibold ${valorColor}`}>
          R$ {formatBRL(valor)}
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
