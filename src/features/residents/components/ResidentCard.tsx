import type { ResidentResponse } from "@/src/types/resident.types";

import { Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface ResidentCardProps {
  morador: ResidentResponse;
  copiadoId: string | null;
  onCopyPix: (morador: ResidentResponse) => void;
}

export const ResidentCard: React.FC<ResidentCardProps> = ({
  morador,
  copiadoId,
  onCopyPix,
}) => {
  return (
    <View>
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
              <Text className="text-lg font-semibold w-[150px]">
                {morador.nome}
              </Text>
              <Text className="text-sm text-gray-500">1 Conta Pendente</Text>
            </View>
          </View>

          <View className="flex-row items-center gap-2 rounded-md border px-3 border-orange-600">
            <Text className="text-sm text-orange-500">Pendente</Text>
          </View>
        </View>

        {/* conteúdo */}
        <View className="mt-3 space-y-3">
          <View className="mt-2 flex-row justify-between rounded-lg bg-gray-50 p-3">
            <Text className="mb-1 text-sm text-gray-600">Valor Pendente</Text>
            <Text className="font-semibold text-orange-600">R$ 20</Text>
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
    </View>
  );
};
