import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

interface LoadingScreenProps {
  readonly message?: string;
  readonly color?: string;
  readonly size?: "small" | "large";
}

/**
 * Componente de tela de loading reutilizável
 *
 * @param message - Mensagem a ser exibida (padrão: "Carregando...")
 * @param color - Cor do indicador de loading (padrão: "#4F46E5")
 * @param size - Tamanho do indicador (padrão: "large")
 */
export default function LoadingScreen({
  message = "Carregando...",
  color = "#4F46E5",
  size = "large",
}: LoadingScreenProps) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size={size} color={color} />
      <Text className="mt-4 font-inter-medium text-lg text-gray-600">
        {message}
      </Text>
    </View>
  );
}
