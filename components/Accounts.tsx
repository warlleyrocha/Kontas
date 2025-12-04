import type { Conta, Republica } from "@/types/resume"; // ajuste path
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface AccountsTabProps {
  readonly republica: Republica;
  readonly setRepublica: (rep: Republica) => void;
}

export function AccountsTab({ republica, setRepublica }: AccountsTabProps) {
  const [copiadoId, setCopiadoId] = useState<string | null>(null);
  const [expandidaId, setExpandidaId] = useState<string | null>(null);

  const marcarComoPago = (contaId: string) => {
    setRepublica({
      ...republica,
      contas: republica.contas.map((conta) =>
        conta.id === contaId
          ? {
              ...conta,
              pago: !conta.pago,
              pagoEm: !conta.pago ? new Date().toISOString() : undefined,
            }
          : conta
      ),
    });
  };

  const copiarChavePix = async (conta: Conta) => {
    const responsavel = republica.moradores.find(
      (m) => m.id === conta.responsavelId
    );

    if (responsavel?.chavePix) {
      await Clipboard.setStringAsync(responsavel.chavePix);
      setCopiadoId(conta.id);
      Alert.alert("Pix copiado!", "Chave PIX copiada com sucesso.");
      setTimeout(() => setCopiadoId(null), 1500);
    } else {
      Alert.alert("Erro", "Nenhuma chave PIX cadastrada para este morador.");
    }
  };

  const contasOrdenadas = [...republica.contas].sort((a, b) => {
    if (a.pago !== b.pago) return a.pago ? 1 : -1;
    return new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime();
  });

  const renderContaCard = (conta: Conta) => {
    const vencimento = new Date(conta.vencimento);
    const hoje = new Date();
    const vencida = vencimento < hoje && !conta.pago;
    const responsavel = republica.moradores.find(
      (m) => m.id === conta.responsavelId
    );

    return (
      <View
        key={conta.id}
        className={`mb-3 rounded-lg bg-white p-4 shadow-sm ${
          vencida ? "border border-orange-300 bg-orange-50" : ""
        }`}
      >
        {/* Header */}
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            {/* Linha: checkbox + título */}
            <TouchableOpacity
              className="mb-2 flex-row items-center gap-2"
              onPress={() => marcarComoPago(conta.id)}
            >
              <MaterialCommunityIcons
                name={conta.pago ? "checkbox-marked" : "checkbox-blank-outline"}
                size={24}
                color={conta.pago ? "#16a34a" : "#6b7280"}
              />

              <Text
                className={`text-base font-semibold ${
                  conta.pago ? "text-gray-400 line-through" : ""
                }`}
              >
                {conta.descricao}
              </Text>
            </TouchableOpacity>

            {/* Infos secundárias */}
            <View className="mt-1 flex-row flex-wrap gap-3">
              {/* Data */}
              <View className="flex-row items-center gap-1">
                <Ionicons name="calendar-outline" size={16} color="#4b5563" />
                <Text className="text-sm text-gray-600">
                  {vencimento.toLocaleDateString("pt-BR")}
                </Text>
              </View>

              {/* Responsável */}
              {responsavel && (
                <View className="rounded-md border border-indigo-600 px-2 py-1">
                  <Text className="text-xs text-indigo-600">
                    Responsável: {responsavel.nome}
                  </Text>
                </View>
              )}

              {/* Vencida */}
              {!conta.pago && vencida && (
                <View className="rounded-md bg-orange-600 px-2 py-1">
                  <Text className="text-xs text-white">Vencida</Text>
                </View>
              )}

              {/* Pago */}
              {conta.pago && (
                <View className="rounded-md border border-green-600 px-2 py-1">
                  <Text className="text-xs text-green-600">Pago</Text>
                </View>
              )}
            </View>
          </View>

          {/* Valor à direita */}
          <View className="ml-2 items-end">
            <Text className="font-semibold text-indigo-600">
              R$ {conta.valor.toFixed(2)}
            </Text>
            {conta.metodoPagamento && (
              <Text className="mt-1 text-xs text-gray-500">
                {conta.metodoPagamento}
              </Text>
            )}
          </View>
        </View>

        {/* Conteúdo */}
        <View className="mt-4 space-y-3">
          {/* Divisão - Dropdown */}
          <View className="mb-4 rounded-lg bg-gray-50 p-0">
            <TouchableOpacity
              onPress={() =>
                setExpandidaId(expandidaId === conta.id ? null : conta.id)
              }
              className="flex-row items-center justify-between px-4 py-3"
            >
              <Text className="font-semibold text-gray-700">Divisão:</Text>
              <View className="flex-row items-center gap-2">
                <Text className="text-sm text-gray-500">
                  {conta.responsaveis.length}{" "}
                  {conta.responsaveis.length === 1 ? "pessoa" : "pessoas"}
                </Text>
                <MaterialCommunityIcons
                  name={
                    expandidaId === conta.id ? "chevron-up" : "chevron-down"
                  }
                  size={24}
                  color="#6b7280"
                />
              </View>
            </TouchableOpacity>

            {/* Conteúdo do Dropdown */}
            {expandidaId === conta.id && (
              <View className="border-t border-gray-200 px-4 py-3">
                <View className="space-y-2">
                  {conta.responsaveis.map((resp) => {
                    const morador = republica.moradores.find(
                      (m) => m.id === resp.moradorId
                    );

                    return (
                      <View
                        key={resp.moradorId}
                        className="flex-row items-center justify-between rounded-lg bg-white p-3"
                      >
                        <View className="flex-1">
                          <Text className="font-medium text-gray-800">
                            {morador?.nome}
                          </Text>
                        </View>
                        <Text className="font-bold text-indigo-600">
                          R$ {resp.valor.toFixed(2)}
                        </Text>
                      </View>
                    );
                  })}

                  {/* Total da divisão */}
                  <View className="mt-3 border-t border-gray-200 pt-3">
                    <View className="flex-row items-center justify-between rounded-lg bg-indigo-50 p-3">
                      <Text className="font-bold text-indigo-900">Total:</Text>
                      <Text className="text-lg font-bold text-indigo-600">
                        R${" "}
                        {conta.responsaveis
                          .reduce((acc, r) => acc + r.valor, 0)
                          .toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Copiar PIX */}
          {!conta.pago && responsavel?.chavePix && (
            <TouchableOpacity
              onPress={() => copiarChavePix(conta)}
              className="flex-row items-center justify-center rounded-md border border-indigo-600 px-4 py-2"
            >
              {copiadoId === conta.id ? (
                <>
                  <Ionicons name="checkmark" size={18} color="#16a34a" />
                  <Text className="ml-2 text-green-600">Copiado!</Text>
                </>
              ) : (
                <>
                  <Feather name="copy" size={18} color="#4b5563" />
                  <Text className="ml-2 text-gray-700">Copiar Chave PIX</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Pago em */}
          {conta.pago && conta.pagoEm && (
            <Text className="text-sm text-gray-500">
              Pago em: {new Date(conta.pagoEm).toLocaleDateString("pt-BR")}
            </Text>
          )}
        </View>
      </View>
    );
  };

  if (contasOrdenadas.length === 0) {
    return (
      <View className="mt-6 items-center rounded-lg bg-white p-6 shadow-sm">
        <Feather name="dollar-sign" size={48} color="#9ca3af" />
        <Text className="mt-4 text-center text-gray-500">
          Nenhuma conta cadastrada ainda.{"\n"}
          Clique em &quot;Nova Conta&quot; para adicionar.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ paddingVertical: 12 }}>
      {contasOrdenadas.map(renderContaCard)}
    </ScrollView>
  );
}
