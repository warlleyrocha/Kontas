import type { ResidentResponse } from "@/src/shared/types/resident.types";

import { useResidentCard } from "@/src/features/residents/hooks/useResidentCard";
import { getInitials } from "@/src/utils/getInitials";
import { Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";

interface ResidentCardProps {
  morador: ResidentResponse;
  onCopyPix: (morador: ResidentResponse) => void;
}

export const ResidentCard: React.FC<ResidentCardProps> = ({
  morador,
  onCopyPix,
}) => {
  const {
    expanded,
    copiado,
    imageError,
    animatedStyle,
    toggleExpanded,
    handleCopyPix,
    setImageError,
  } = useResidentCard(morador, onCopyPix);

  return (
    <View className="rounded-3xl border border-[#E7E7EA] bg-white p-5">
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1 flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#F2F2F7]">
            {morador.fotoPerfil && !imageError ? (
              <Image
                source={{ uri: morador.fotoPerfil }}
                className="h-full w-full rounded-full"
                onError={() => setImageError(true)}
              />
            ) : (
              <Text className="text-sm font-semibold text-[#111827]">
                {getInitials(morador.nome)}
              </Text>
            )}
          </View>

          <View className="flex-1">
            <Text
              className="text-base font-semibold text-[#111827]"
              numberOfLines={1}
            >
              {morador.nome}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={toggleExpanded}
        accessibilityRole="button"
        accessibilityLabel={
          expanded ? "Recolher detalhes" : "Ver mais detalhes"
        }
        className="mt-4 flex-row items-center justify-between rounded-full bg-[#F5F5F7] px-4 py-3"
      >
        <Text className="text-sm font-medium text-gray-600">
          Ver mais detalhes
        </Text>
        <Feather
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color="#6B7280"
        />
      </TouchableOpacity>

      <Animated.View style={animatedStyle}>
        <View className="mt-4 rounded-3xl bg-[#F5F5F7] p-4">
          <Text className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Contato
          </Text>

          <View className="mt-3 gap-3">
            <View>
              <Text className="text-xs font-medium text-gray-500">Email</Text>
              <Text className="mt-1 text-sm text-[#111827]" numberOfLines={1}>
                {morador.email || "Não informado"}
              </Text>
            </View>

            <View>
              <Text className="text-xs font-medium text-gray-500">
                Telefone
              </Text>
              <Text className="mt-1 text-sm text-[#111827]" numberOfLines={1}>
                {morador.telefone || "Não informado"}
              </Text>
            </View>
          </View>

          <Text className="mt-4 text-xs font-medium uppercase tracking-wide text-gray-400">
            Chave PIX
          </Text>

          <View className=" flex-row items-center gap-3">
            <Text className="flex-1 text-sm text-[#111827]" numberOfLines={2}>
              {morador.chavePix || "Não informado"}
            </Text>

            {morador.chavePix ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleCopyPix}
                accessibilityRole="button"
                accessibilityLabel={
                  copiado ? "Chave PIX copiada" : "Copiar chave PIX"
                }
                className="min-h-11 min-w-11 flex-row items-center justify-center rounded-full bg-white px-4"
              >
                {copiado ? (
                  <Ionicons name="checkmark" size={18} color="#16a34a" />
                ) : (
                  <Feather name="copy" size={18} color="#374151" />
                )}
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </Animated.View>
    </View>
  );
};
