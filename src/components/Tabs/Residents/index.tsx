import type { ResidentResponse } from "@/src/types/resident.types";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { FlatList, Text, View } from "react-native";
import { ResidentCard } from "./ResidentCard";
import { useTabResidents } from "./useTabResidents";

interface ResidentsTabProps {
  residents: ResidentResponse[];
}

export const ResidentsTab: React.FC<ResidentsTabProps> = ({ residents }) => {
  const { copiadoId, copiarChavePix } = useTabResidents();

  const renderMorador = ({ item }: { item: ResidentResponse }) => {
    return (
      <ResidentCard
        morador={item}
        copiadoId={copiadoId}
        onCopyPix={copiarChavePix}
      />
    );
  };

  const renderItemSeparator = () => <View className="h-4" />;

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <Feather name="users" size={64} color="#D1D5DB" />
      <Text className="mt-4 text-base text-gray-500">
        Nenhum morador cadastrado
      </Text>
    </View>
  );

  return (
    <View className="flex-1">
      <FlatList
        data={residents}
        keyExtractor={(m) => m.id}
        renderItem={renderMorador}
        ItemSeparatorComponent={renderItemSeparator}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={{ paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default ResidentsTab;
