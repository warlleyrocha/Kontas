import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

interface ResumoCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  color: string;
  isLoading: boolean;
}

export const ResumoCard = ({
  label,
  value,
  icon,
  description,
  color,
  isLoading,
}: ResumoCardProps) => (
  <View className="mb-4 w-full rounded-lg bg-white p-4 shadow-sm md:w-[32%]">
    <View className="pb-3">
      <Text className="text-gray-500">{label}</Text>
      <View className="mt-2 flex-row items-center gap-2">
        {icon}
        {isLoading ? (
          <ActivityIndicator size="small" color={color} />
        ) : (
          <Text className="text-lg font-semibold">R$ {value.toFixed(2)}</Text>
        )}
      </View>
    </View>
    <View>
      <Text className="text-sm text-gray-600">{description}</Text>
    </View>
  </View>
);
