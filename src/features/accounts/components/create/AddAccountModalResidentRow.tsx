import { View, Text, TextInput, Image, TouchableOpacity } from "react-native";
import {
  maskCurrencyBRL,
  unmaskCurrencyBRL,
} from "@/src/shared/utils/inputMasks";
import { formatBRL } from "@/src/shared/utils/formats";

import type {
  MoradorDivisao,
  TipoDivisao,
} from "../../types/accountForm.types";

import Feather from "@expo/vector-icons/Feather";

interface ResidentRowProps {
  readonly morador: MoradorDivisao;
  readonly tipoDivisao: TipoDivisao;
  readonly onToggle: () => void;
  readonly onValorChange: (value: string) => void;
}

export default function ResidentRow({
  morador,
  tipoDivisao,
  onToggle,
  onValorChange,
}: ResidentRowProps) {
  return (
    <View className="flex-row items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
      <View className="relative mr-3">
        {morador.fotoPerfil ? (
          <Image
            source={{ uri: morador.fotoPerfil }}
            className="h-12 w-12 rounded-full"
          />
        ) : (
          <View className="h-12 w-12 items-center justify-center rounded-full bg-gray-200">
            <Text className="text-lg font-bold text-gray-500">
              {morador.nome.charAt(0)}
            </Text>
          </View>
        )}
        {morador.checked && (
          <View className="absolute bottom-0 right-[-3px] h-8 w-6 items-center justify-center rounded-full bg-teal border-[3px] border-white">
            <Feather name="check" size={11} color="#fff" />
          </View>
        )}
      </View>

      <View className="flex-1">
        <Text className="font-inter-bold text-gray-900">{morador.nome}</Text>
        <Text className="text-xs text-gray-400">{morador.role}</Text>
      </View>

      <View className="mr-3 items-end">
        {tipoDivisao === "custom" && morador.checked ? (
          <TextInput
            value={morador.valor}
            onChangeText={(text) => onValorChange(maskCurrencyBRL(text))}
            keyboardType="numeric"
            placeholder="0,00"
            className="min-w-[80px] rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-right text-sm font-semibold text-teal"
          />
        ) : (
          <Text className="text-sm font-semibold text-teal">
            R$ {formatBRL(unmaskCurrencyBRL(morador.valor || "0") / 100)}
          </Text>
        )}
      </View>

      <TouchableOpacity
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={`${morador.checked ? "Desmarcar" : "Selecionar"} morador ${morador.nome}`}
        className={`h-6 w-6 items-center justify-center rounded-md border-2 ${
          morador.checked ? "border-teal bg-teal" : "border-gray-300 bg-white"
        }`}
      >
        <Feather
          name="check"
          size={14}
          color={morador.checked ? "#fff" : "transparent"}
        />
      </TouchableOpacity>
    </View>
  );
}
