import Feather from "@expo/vector-icons/Feather";
import { Text, TouchableOpacity, View } from "react-native";

interface AddAccountModalHeaderProps {
  readonly onClose: () => void;
}

export function AddAccountModalHeader({ onClose }: AddAccountModalHeaderProps) {
  return (
    <View className="bg-white w-full border-b-1 rounded-t-3xl py-2 px-6 gap-3 flex-row items-center justify-start">
      <TouchableOpacity
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Fechar modal de nova conta"
        className="p-2"
      >
        <Feather name="x" size={20} color="#337176" />
      </TouchableOpacity>

      <View>
        <Text className="text-lg font-semibold text-[#327072]">Nova Conta</Text>
        <Text className="mt-1 text-sm text-gray-500">
          Adicione uma nova conta para a república
        </Text>
      </View>
    </View>
  );
}
