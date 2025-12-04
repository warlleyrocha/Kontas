import { DeleteButton } from "@/components/ui/delete-button";
import type { Morador } from "@/types/resume";
import { Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface ResidentCardProps {
  morador: Morador;
  divida: number;
  qtdContasPendentes: number;
  copiadoId: string | null;
  onPress: (morador: Morador) => void;
  onCopyPix: (morador: Morador) => void;
  onDelete: (morador: Morador) => void;
}

export const ResidentCard: React.FC<ResidentCardProps> = ({
  morador,
  divida,
  qtdContasPendentes,
  copiadoId,
  onPress,
  onCopyPix,
  onDelete,
}) => {
  const isPendente = divida > 0;

  return (
    <TouchableOpacity onPress={() => onPress(morador)} activeOpacity={0.7}>
      <View className="rounded-lg bg-white p-4 shadow-sm">
        {/* header */}
        <View className="flex-row items-start justify-between">
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
              {morador.fotoPerfil ? (
                <Image
                  source={{ uri: morador.fotoPerfil }}
                  className="h-12 w-12 rounded-full"
                />
              ) : (
                <Feather name="user" size={20} color="#4f46e5" />
              )}
            </View>

            <View>
              <Text className="text-lg font-semibold">{morador.nome}</Text>
              <Text className="text-sm text-gray-500">
                {qtdContasPendentes}{" "}
                {qtdContasPendentes === 1
                  ? "conta pendente"
                  : "contas pendentes"}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-2">
            <DeleteButton onPress={() => onDelete(morador)} />

            <View
              className={`rounded-md border px-3 py-1 ${
                isPendente ? "border-orange-600" : "border-green-600"
              }`}
            >
              <Text
                className={`text-sm ${
                  isPendente ? "text-orange-600" : "text-green-600"
                }`}
              >
                {isPendente ? "Pendente" : "Em dia"}
              </Text>
            </View>
          </View>
        </View>

        {/* conteúdo */}
        <View className="mt-3 space-y-3">
          <View className="mt-2 flex-row justify-between rounded-lg bg-gray-50 p-3">
            <Text className="mb-1 text-sm text-gray-600">Valor Pendente</Text>
            <Text
              className={
                isPendente
                  ? "font-semibold text-orange-600"
                  : "font-semibold text-green-600"
              }
            >
              R$ {divida.toFixed(2)}
            </Text>
          </View>

          {morador.chavePix ? (
            <View className="mt-4">
              <Text className="mb-2 text-sm text-gray-600">Chave PIX</Text>

              <View className="flex-row items-center gap-2">
                <View className="flex-1 rounded bg-gray-50 p-2">
                  <Text className="text-sm">{morador.chavePix}</Text>
                </View>

                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    onCopyPix(morador);
                  }}
                  className="rounded-md border border-[#374151] px-3 py-2"
                >
                  {copiadoId === morador.id ? (
                    <Ionicons name="checkmark" size={18} color="#16a34a" />
                  ) : (
                    <Feather name="copy" size={18} color="#374151" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};
