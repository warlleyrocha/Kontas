import Feather from "@expo/vector-icons/Feather";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import type { MoradorDivisao, TipoDivisao } from "../../hooks/useAccountForm";

interface AddAccountModalResidentsSectionProps {
  readonly tipoDivisao: TipoDivisao;
  readonly moradoresDivisao: MoradorDivisao[];
  readonly totalDivisaoPreenchido: number;
  readonly onSetTipoDivisao: (type: TipoDivisao) => void;
  readonly onToggleMorador: (moradorId: string) => void;
  readonly onMoradorValorChange: (moradorId: string, value: string) => void;
  readonly onValorInputFocusChange: (isFocused: boolean) => void;
}

interface DivisionOptionProps {
  readonly selected: boolean;
  readonly label: string;
  readonly onPress: () => void;
  readonly className?: string;
}

function DivisionOption({
  selected,
  label,
  onPress,
  className,
}: DivisionOptionProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center ${className ?? ""}`}
    >
      <View
        className={`mr-3 h-4 w-4 rounded-full border border-teal ${
          selected ? "bg-teal" : "bg-transparent"
        }`}
      />
      <Text>{label}</Text>
    </TouchableOpacity>
  );
}

export function AddAccountModalResidentsSection({
  tipoDivisao,
  moradoresDivisao,
  totalDivisaoPreenchido,
  onSetTipoDivisao,
  onToggleMorador,
  onMoradorValorChange,
  onValorInputFocusChange,
}: AddAccountModalResidentsSectionProps) {
  return (
    <>
      <View className="mb-3 border-t border-gray-200 pt-3">
        <Text className="mb-2 text-sm text-gray-700">Tipo de Divisão</Text>
        <View>
          <DivisionOption
            selected={tipoDivisao === "equal"}
            label="Dividir igualmente"
            onPress={() => onSetTipoDivisao("equal")}
            className="mb-2"
          />

          <DivisionOption
            selected={tipoDivisao === "custom"}
            label="Valores customizados"
            onPress={() => onSetTipoDivisao("custom")}
          />
        </View>
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-sm text-gray-700">
          Selecione os Moradores
        </Text>

        <View className="space-y-2">
          {moradoresDivisao.map((morador) => (
            <View
              key={morador.moradorId}
              className="flex-row items-center justify-between rounded-md bg-teal/5 px-3 py-2"
            >
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() => onToggleMorador(morador.moradorId)}
                  className={`mr-3 h-6 w-6 items-center justify-center rounded-sm border ${
                    morador.checked
                      ? "border-teal bg-teal"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  <Feather
                    name="check"
                    size={14}
                    color={morador.checked ? "#fff" : "transparent"}
                  />
                </TouchableOpacity>

                <Text>{morador.nome}</Text>
              </View>

              <View style={{ width: 120 }}>
                <TextInput
                  value={morador.valor}
                  editable={morador.checked && tipoDivisao === "custom"}
                  onFocus={() => onValorInputFocusChange(true)}
                  onBlur={() => onValorInputFocusChange(false)}
                  onChangeText={(value) =>
                    onMoradorValorChange(morador.moradorId, value)
                  }
                  keyboardType="numeric"
                  className={`rounded px-2 py-1 text-right ${
                    morador.checked && tipoDivisao === "custom"
                      ? "bg-white"
                      : "bg-white text-gray-900"
                  }`}
                />
              </View>
            </View>
          ))}
        </View>

        <View className="mr-2 mt-8 flex-row items-center justify-between">
          <Text className="text-sm text-gray-500">Total preenchido</Text>
          <Text className="text-sm font-semibold">
            R$ {totalDivisaoPreenchido.toFixed(2).replace(".", ",")}
          </Text>
        </View>
      </View>
    </>
  );
}
