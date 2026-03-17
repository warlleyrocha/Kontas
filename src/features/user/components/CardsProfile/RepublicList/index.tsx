import Ionicons from "@expo/vector-icons/Ionicons";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { RepublicResponse } from "@/src/features/republic/types/republic.types";
import RepublicCard from "@/src/features/user/components/RepublicCard";

interface CardPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface RepublicListProps {
  readonly republics: RepublicResponse[];
  readonly onSelectRepublic: (id: string) => void;
  readonly onCreateRepublic: () => void;
  readonly onLongPressRepublic?: (
    republic: RepublicResponse,
    position: CardPosition
  ) => void;
  readonly refreshing?: boolean;
  readonly onRefresh?: () => void | Promise<void>;
  readonly getResidentsCount: (republicId: string) => number;
}

export default function RepublicList({
  republics,
  onSelectRepublic,
  onCreateRepublic,
  onLongPressRepublic,
  refreshing = false,
  onRefresh,
  getResidentsCount,
}: RepublicListProps) {
  return (
    <ScrollView
      className="flex-1 px-6 pt-6"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#337176"]} // Cor do loading (Android)
            tintColor="#337176" // Cor do loading (iOS)
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
            onSelect={() => onSelectRepublic(republic.id)}
            onLongPress={onLongPressRepublic}
          />
        ))}
      </View>

      <TouchableOpacity
        onPress={onCreateRepublic}
        className="mb-6 mt-2 flex-row items-center justify-center rounded-xl border-2 border-dashed border-teal/40 bg-teal/5 px-6 py-4"
        activeOpacity={0.8}
      >
        <Ionicons name="add-circle-outline" size={24} color="#337176" />
        <Text className="ml-2 text-base font-semibold text-teal">
          Adicionar Nova República
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
