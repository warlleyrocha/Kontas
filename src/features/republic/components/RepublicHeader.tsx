import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import type { RepublicResponse } from "@/src/features/republic/types/republic.types";
import { MenuButton } from "@/src/shared/components/SideMenu";

interface RepublicHeaderProps {
  readonly republic: RepublicResponse;
  readonly numberResidents: number;
  readonly isFavorited: boolean;
  readonly onEdit: () => void;
  readonly onToggleFavorite: () => void;
  readonly onMenuOpen: () => void;
  readonly hasNotification?: boolean;
}

export function RepublicHeader({
  republic,
  isFavorited,
  numberResidents,
  onEdit,
  onToggleFavorite,
  onMenuOpen,
  hasNotification,
}: RepublicHeaderProps) {
  const residentsLabel = numberResidents === 1 ? "Morador" : "Moradores";
  const [imageError, setImageError] = useState(false);

  return (
    <View className="mt-[32px] flex-row gap-3 border-b border-b-black/10 bg-[#FAFAFA] px-[16px] py-4">
      {/* Imagem */}
      <View className="h-[50px] w-[50px] items-center justify-center rounded-full bg-gray-300">
        {republic.imagemRepublica && !imageError ? (
          <Image
            source={{ uri: republic.imagemRepublica }}
            className="h-[50px] w-[50px] rounded-full"
            onError={() => setImageError(true)}
          />
        ) : (
          <Feather name="image" size={32} color="#6b7280" />
        )}
      </View>

      {/* Nome + ação de editar */}
      <TouchableOpacity
        onPress={onEdit}
        className="flex-1 justify-center"
        accessibilityRole="button"
        accessibilityLabel="Editar república"
      >
        <Text className="text-base font-semibold">
          {republic.nome ?? "República"}
        </Text>
        <Text className="text-sm text-gray-500">
          {numberResidents} {residentsLabel}
        </Text>
      </TouchableOpacity>

      {/* Favorito */}
      <TouchableOpacity
        onPress={onToggleFavorite}
        className="items-center justify-center rounded-full p-2 mb-2"
        accessibilityRole="button"
        accessibilityLabel={
          isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"
        }
      >
        <MaterialCommunityIcons
          name={isFavorited ? "star" : "star-outline"}
          size={22}
          color={isFavorited ? "#f59e0b" : "#6b7280"}
        />
      </TouchableOpacity>

      {/* Menu lateral */}
      <MenuButton onPress={onMenuOpen} hasNotification={hasNotification} />
    </View>
  );
}
