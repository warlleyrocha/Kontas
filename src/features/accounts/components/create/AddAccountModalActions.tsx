import { Text, TouchableOpacity, View } from "react-native";

interface AddAccountModalActionsProps {
  readonly onSubmit: () => void;
  readonly onCancel: () => void;
}

export function AddAccountModalActions({
  onSubmit,
  onCancel,
}: AddAccountModalActionsProps) {
  return (
    <View className="mt-[10px] flex-row gap-3">
      <TouchableOpacity
        onPress={onSubmit}
        className="flex-1 items-center rounded-md bg-indigo-600 py-3"
      >
        <Text className="font-medium text-white">Adicionar Conta</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onCancel}
        className="flex-1 items-center rounded-md border border-gray-300 py-3"
      >
        <Text className="font-medium text-gray-700">Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}
