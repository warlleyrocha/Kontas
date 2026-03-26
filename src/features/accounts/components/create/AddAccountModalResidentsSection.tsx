import Feather from "@expo/vector-icons/Feather";
import { Text, View } from "react-native";

import DivisionOption from "@/src/shared/components/DivisionOption";
import ResidentRow from "./AddAccountModalResidentRow";

import type {
  MoradorDivisao,
  TipoDivisao,
} from "../../types/accountForm.types";

import { formatBRL } from "@/src/shared/utils/formats";

interface AddAccountModalResidentsSectionProps {
  readonly tipoDivisao: TipoDivisao;
  readonly moradoresDivisao: MoradorDivisao[];
  readonly totalDivisaoPreenchido: number;
  readonly valorTotal: string;
  readonly onSetTipoDivisao: (type: TipoDivisao) => void;
  readonly onToggleMorador: (moradorId: string) => void;
  readonly onMoradorValorChange: (moradorId: string, value: string) => void;
}

export function AddAccountModalResidentsSection({
  tipoDivisao,
  moradoresDivisao,
  totalDivisaoPreenchido,
  valorTotal,
  onSetTipoDivisao,
  onToggleMorador,
  onMoradorValorChange,
}: AddAccountModalResidentsSectionProps) {
  const valorTotalNumerico = parseFloat(valorTotal.replace(",", ".")) || 0;
  const restante = valorTotalNumerico - totalDivisaoPreenchido;
  const progressPercent =
    valorTotalNumerico > 0
      ? Math.min((totalDivisaoPreenchido / valorTotalNumerico) * 100, 100)
      : 0;
  return (
    <>
      <View className="mb-3">
        <Text className="mb-2 text-sm text-gray-700">Tipo de Divisão</Text>
        <View className="flex-row justify-between gap-2">
          <DivisionOption
            selected={tipoDivisao === "equal"}
            label={"DIVIDIR\nIGUALMENTE"}
            onPress={() => onSetTipoDivisao("equal")}
            icon={
              <Feather
                name="bar-chart-2"
                size={24}
                color={tipoDivisao === "equal" ? "#BEFCFE" : "#666"}
              />
            }
          />

          <DivisionOption
            selected={tipoDivisao === "custom"}
            label={"VALORES\nCUSTOMIZADOS"}
            onPress={() => onSetTipoDivisao("custom")}
            icon={
              <Feather
                name="edit-2"
                size={24}
                color={tipoDivisao === "custom" ? "#BEFCFE" : "#666"}
              />
            }
          />
        </View>
      </View>

      {tipoDivisao === "custom" && (
        <View className="mb-3">
          <View className="flex-row justify-between mb-1">
            <Text className="text-xs text-gray-500">
              R$ {formatBRL(totalDivisaoPreenchido)} de R${" "}
              {formatBRL(valorTotalNumerico)}
            </Text>
            <Text
              className={`text-xs font-semibold ${restante <= 0 ? "text-teal" : "text-gray-400"}`}
            >
              {restante <= 0 ? "Completo" : `Faltam R$ ${formatBRL(restante)}`}
            </Text>
          </View>
          <View className="h-2 rounded-full bg-gray-200">
            <View
              className="h-2 rounded-full bg-teal"
              style={{ width: `${progressPercent}%` }}
            />
          </View>
        </View>
      )}

      <View className="mb-4">
        <Text className="mb-2 text-sm text-gray-700">
          Selecione os Moradores
        </Text>

        <View className="gap-3">
          {moradoresDivisao.map((morador) => (
            <ResidentRow
              key={morador.moradorId}
              morador={morador}
              tipoDivisao={tipoDivisao}
              onToggle={() => onToggleMorador(morador.moradorId)}
              onValorChange={(value) =>
                onMoradorValorChange(morador.moradorId, value)
              }
            />
          ))}
        </View>
      </View>
    </>
  );
}
