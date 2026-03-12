import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

export function PaymentsLoadingState() {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" />
      <Text className="mt-4 text-gray-500">Carregando pagamentos...</Text>
    </View>
  );
}
