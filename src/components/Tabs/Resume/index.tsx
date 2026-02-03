import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import {
  totalContas,
  contasPagas,
  contasPendentes,
  quantidadeContasPagas,
  quantidadeContasPendentes,
  quantidadeTotalContas,
  republicaMock,
  dividas,
} from "@/src/constants/resume.logic";

export const ResumeTab = () => {
  const resumoCards = [
    {
      id: 1,
      label: "Total de Contas",
      value: totalContas,
      icon: <Ionicons name="cash-outline" size={20} color="#2563eb" />,
      description: `${quantidadeTotalContas} contas registradas`,
      color: "#2563eb",
    },
    {
      id: 2,
      label: "Contas Pagas",
      value: contasPagas,
      icon: (
        <Ionicons name="checkmark-circle-outline" size={20} color="#16a34a" />
      ),
      description: `${quantidadeContasPagas} de ${quantidadeTotalContas} pagas`,
      color: "#16a34a",
    },
    {
      id: 3,
      label: "Pendentes",
      value: contasPendentes,
      icon: <Ionicons name="alert-circle-outline" size={20} color="#f97316" />,
      description: `${quantidadeContasPendentes} contas a pagar`,
      color: "#f97316",
    },
  ];

  return (
    <ScrollView contentContainerStyle={{ paddingVertical: 12 }}>
      {/* Cards Resume (3) */}
      <View className="flex-row flex-wrap justify-between ">
        {resumoCards.map((card) => (
          <View
            key={card.id}
            className="mb-4 w-full rounded-lg bg-white p-4 shadow-sm md:w-[32%]"
          >
            <View className="pb-3">
              <Text className="text-gray-500">{card.label}</Text>
              <View className="mt-2 flex-row items-center gap-2">
                {card.icon}
                <Text className="text-lg font-semibold">
                  R$ {card.value.toFixed(2)}
                </Text>
              </View>
            </View>

            <View>
              <Text className="text-sm text-gray-600">{card.description}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Card 4 - Dívidas por morador */}
      <View className="rounded-lg bg-white p-4 shadow-sm">
        <View className="mb-3">
          <Text className="text-base font-semibold">Dívidas por Morador</Text>
          <Text className="text-sm text-gray-500">
            Valores pendentes de cada morador
          </Text>
        </View>

        <View className="gap-3 space-y-3">
          {republicaMock.moradores.map((morador) => {
            const valor = dividas[morador.id] ?? 0;
            const isPendente = valor > 0;

            return (
              <View
                key={morador.id}
                className="flex-row items-center justify-between rounded-lg bg-gray-50 p-4"
              >
                <View>
                  <Text className="text-base">{morador.nome}</Text>
                  {morador.chavePix ? (
                    <Text className="text-sm text-gray-500">
                      PIX: {morador.chavePix}
                    </Text>
                  ) : null}
                </View>

                <View className="items-end">
                  <Text
                    className={
                      isPendente
                        ? "font-semibold text-orange-600"
                        : "font-semibold text-green-600"
                    }
                  >
                    R$ {valor.toFixed(2)}
                  </Text>

                  {/* Badge simples */}
                  <View
                    className={`mt-1 rounded-md border px-2 py-1 ${
                      isPendente ? "border-orange-600" : "border-green-600"
                    }`}
                  >
                    <Text
                      className={
                        isPendente
                          ? "text-sm text-orange-600"
                          : "text-sm text-green-600"
                      }
                    >
                      {isPendente ? "Pendente" : "Em dia"}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};
