import { ActivityIndicator, Text, View } from "react-native";

export function PaymentsLoadingState() {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="#337176" />
      <Text className="mt-4 text-gray-500">Carregando pagamentos...</Text>
    </View>
  );
}
