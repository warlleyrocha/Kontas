import Feather from "@expo/vector-icons/Feather";
import { Text, TouchableOpacity, View } from "react-native";

interface NextButtonProps {
  readonly onNext: () => Promise<void> | void;
  readonly onCancel: () => void;
  readonly disabled?: boolean;
}

export function NextButton({
  onNext,
  onCancel,
  disabled = false,
}: NextButtonProps) {
  return (
    <View className="mt-[18px] flex-col gap-3">
      <TouchableOpacity
        onPress={onNext}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Próximo"
        accessibilityState={{ disabled }}
        className={`flex-row items-center justify-center rounded-xl py-3 ${
          disabled ? "bg-gray-300" : "bg-teal"
        }`}
      >
        <Text
          className={`font-medium ${disabled ? "text-gray-500" : "text-white"}`}
        >
          Próximo
        </Text>
        <Feather
          name="arrow-right"
          size={16}
          color={disabled ? "#6b7280" : "white"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onCancel}
        accessibilityRole="button"
        accessibilityLabel="Cancelar adição de conta"
        className="items-center py-3"
      >
        <Text className="font-medium text-[#327072]">Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}
