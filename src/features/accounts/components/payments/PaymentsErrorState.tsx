import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface PaymentsErrorStateProps {
  readonly message: string;
  readonly onRetry: () => void;
}

export function PaymentsErrorState({
  message,
  onRetry,
}: PaymentsErrorStateProps) {
  return (
    <View className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
      <Text className="text-sm font-semibold text-red-700">
        Não foi possível carregar os pagamentos.
      </Text>
      <Text className="mt-1 text-sm text-red-600">{message}</Text>

      <TouchableOpacity
        onPress={onRetry}
        className="mt-4 self-start rounded-xl bg-red-600 px-4 py-2"
        activeOpacity={0.8}
      >
        <Text className="font-semibold text-white">Tentar novamente</Text>
      </TouchableOpacity>
    </View>
  );
}
