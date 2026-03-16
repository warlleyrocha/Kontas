import type { RepublicResponse } from "@/src/features/republic/types/republic.types";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface RepublicaCardProps {
  readonly republic: RepublicResponse;
  readonly residentsCount?: number;
  //readonly onEdit: () => void;
  readonly onSelect: () => void;
}

export default function RepublicCard({
  republic,
  residentsCount = 0,
  //onEdit,
  onSelect,
}: RepublicaCardProps) {
  const residentsLabel = residentsCount === 1 ? "Morador" : "Moradores";
  const [imageError, setImageError] = useState(false);

  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.9}
      className="mb-4 w-44 overflow-hidden rounded-3xl bg-white shadow-sm"
    >
      {/* Imagem */}
      <View className="h-36 w-full items-center justify-center overflow-hidden bg-gray-100">
        {republic.imagemRepublica && !imageError ? (
          <Image
            source={{ uri: republic.imagemRepublica }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <Text className="text-5xl">🏠</Text>
        )}
      </View>

      {/* Info */}
      <View className="p-4">
        <Text className="text-lg font-bold text-gray-800" numberOfLines={2}>
          {republic.nome}
        </Text>

        <View className="mt-2 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="people-outline" size={14} color="#3B82F6" />
            <Text className="ml-1 text-sm font-medium text-gray-600">
              {residentsCount} {residentsLabel}
            </Text>
          </View>

          {/* 
          <TouchableOpacity
            onPress={onEdit}
            className="rounded-full bg-blue-100 p-2"
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={16} color="#3B82F6" />
          </TouchableOpacity>
          */}
        </View>
      </View>
    </TouchableOpacity>
  );
}
