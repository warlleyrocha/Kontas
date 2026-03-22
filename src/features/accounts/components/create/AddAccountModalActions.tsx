import { Text, TouchableOpacity, View } from "react-native";

interface AddAccountModalActionsProps {
  readonly onSubmit: () => Promise<void> | void;
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
        accessibilityRole="button"
        accessibilityLabel="Adicionar conta"
        className="flex-1 items-center rounded-md bg-teal py-3"
      >
        <Text className="font-medium text-white">Adicionar Conta</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onCancel}
        accessibilityRole="button"
        accessibilityLabel="Cancelar adição de conta"
        className="flex-1 items-center rounded-md border border-gray-300 py-3"
      >
        <Text className="font-medium text-gray-700">Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}
