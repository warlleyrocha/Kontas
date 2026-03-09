import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

interface AddAccountModalHeaderProps {
  readonly onClose: () => void;
}

export function AddAccountModalHeader({ onClose }: AddAccountModalHeaderProps) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <View>
        <Text className="text-lg font-semibold">Nova Conta</Text>
        <Text className="mt-1 text-sm text-gray-500">
          Adicione uma nova conta para a república
        </Text>
      </View>

      <TouchableOpacity onPress={onClose} className="p-2">
        <Feather name="x" size={24} color="#374151" />
      </TouchableOpacity>
    </View>
  );
}
