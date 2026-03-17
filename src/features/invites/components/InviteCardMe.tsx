import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, TouchableOpacity, View } from "react-native";
import { formatDate } from "@/src/shared/utils/formats";

interface InviteCardProps {
  readonly invite: {
    readonly id: string;
    readonly email: string;
    readonly republicaId: string;
    readonly status: string;
    readonly criadoEm: string;
    readonly atualizadoEm: string;
  };
  readonly onAccept: () => void;
  readonly onReject: () => void;
}

export default function InviteCardMe({
  invite,
  onAccept,
  onReject,
}: InviteCardProps) {
  return (
    <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
      <View className="p-4">
        <Text className="text-lg font-bold text-gray-800">{invite.id}</Text>

        {/*
        <View className="h-28 w-full items-center justify-center overflow-hidden bg-gray-100">
        {invite.republicaImagem ? (
          <Image
            source={{ uri: invite.republicaImagem }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        ) : (
          <Text className="text-4xl">🏠</Text>
        )}
      </View>
      */}

        <View className="mt-2 flex-row items-center">
          <Ionicons name="person-outline" size={14} color="#6B7280" />
          <Text className="ml-1 text-sm text-gray-500">
            Convidado por {invite.republicaId}
          </Text>
        </View>

        <View className="mt-1 flex-row items-center">
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <Text className="ml-1 text-sm text-gray-500">
            Recebido em: {formatDate(invite.criadoEm)}
          </Text>
        </View>
        {invite.status === "ACEITO" || invite.status === "RECUSADO" ? (
          <View className="mt-4 flex-row items-center justify-center">
            <Text
              className={`text-sm font-semibold ${
                invite.status === "ACEITO" ? "text-green-600" : "text-red-500"
              }`}
            >
              {invite.status === "ACEITO" ? "Aceito" : "Recusado"}
            </Text>
          </View>
        ) : (
          <View className="mt-4 flex-row gap-3">
            <TouchableOpacity
              onPress={onReject}
              className="flex-1 flex-row items-center justify-center rounded-xl border border-gray-200 bg-gray-50 py-3"
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={18} color="#6B7280" />
              <Text className="ml-1 font-semibold text-gray-600">Recusar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onAccept}
              className="flex-1 flex-row items-center justify-center rounded-xl bg-indigo-600 py-3"
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark" size={18} color="white" />
              <Text className="ml-1 font-semibold text-white">Aceitar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
