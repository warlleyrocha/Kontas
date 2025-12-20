import { Ionicons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface RepublicaCardProps {
  readonly republica: {
    readonly id: string;
    readonly nome: string;
    readonly imagem: string | null;
    readonly moradores: number;
  };
  readonly onEdit: () => void;
  readonly onSelect: () => void;
}

export default function RepublicCard({
  republica,
  onEdit,
  onSelect,
}: RepublicaCardProps) {
  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.9}
      className="mb-4 w-44 overflow-hidden rounded-3xl bg-white shadow-sm"
    >
      {/* Imagem */}
      <View className="h-36 w-full items-center justify-center overflow-hidden bg-gray-100">
        {republica.imagem ? (
          <Image
            source={{ uri: republica.imagem }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        ) : (
          <Text className="text-5xl">🏠</Text>
        )}
      </View>

      {/* Info */}
      <View className="p-4">
        <Text className="text-lg font-bold text-gray-800" numberOfLines={2}>
          {republica.nome}
        </Text>

        <View className="mt-2 flex-row items-center justify-between">
          <Text className="text-sm font-medium text-blue-500">
            {republica.moradores}{" "}
            {republica.moradores === 1 ? "morador" : "moradores"}
          </Text>

          <TouchableOpacity
            onPress={onEdit}
            className="rounded-full bg-blue-100 p-2"
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={16} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
