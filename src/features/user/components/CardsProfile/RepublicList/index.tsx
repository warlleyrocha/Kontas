import { useRepublicResidents } from "@/src/hooks/useRepublicResidents";
import type { RepublicResponse } from "@/src/features/republic/types/republic.types";
import { Ionicons } from "@expo/vector-icons";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface RepublicListProps {
  readonly republics: RepublicResponse[];
  readonly onEditRepublic: (id: string) => void;
  readonly onSelectRepublic: (id: string) => void;
  readonly onCreateRepublic: () => void;
  readonly RepublicCard: React.ComponentType<{
    republic: RepublicResponse;
    residentsCount?: number;

    onEdit: () => void;
    onSelect: () => void;
  }>;
  readonly refreshing?: boolean;
  readonly onRefresh?: () => void | Promise<void>;
}

export default function RepublicList({
  republics,
  onEditRepublic,
  onSelectRepublic,
  onCreateRepublic,
  RepublicCard,
  refreshing = false,
  onRefresh,
}: RepublicListProps) {
  const { getResidentsCount } = useRepublicResidents(republics);

  return (
    <ScrollView
      className="flex-1 px-6 pt-6"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6366F1"]} // Cor do loading (Android)
            tintColor="#6366F1" // Cor do loading (iOS)
          />
        ) : undefined
      }
    >
      <Text className="mb-4 text-lg font-semibold text-gray-800">
        Suas Repúblicas
      </Text>

      <View className="flex-row flex-wrap gap-4">
        {republics.map((republic) => (
          <RepublicCard
            key={republic.id}
            republic={republic}
            residentsCount={getResidentsCount(republic.id)}
            onEdit={() => onEditRepublic(republic.id)}
            onSelect={() => onSelectRepublic(republic.id)}
          />
        ))}
      </View>

      <TouchableOpacity
        onPress={onCreateRepublic}
        className="mb-6 mt-2 flex-row items-center justify-center rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50 px-6 py-4"
        activeOpacity={0.8}
      >
        <Ionicons name="add-circle-outline" size={24} color="#6366F1" />
        <Text className="ml-2 text-base font-semibold text-indigo-600">
          Adicionar Nova República
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
