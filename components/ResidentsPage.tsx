import { Feather, Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import type { Morador, Republica } from "@/types/resume";

interface ResidentsTabProps {
  republica: Republica;
  setRepublica: (rep: Republica) => void;
}

export const ResidentsTab: React.FC<ResidentsTabProps> = ({
  republica,
  setRepublica,
}) => {
  const [adicionando, setAdicionando] = useState(false);
  const [novoMorador, setNovoMorador] = useState<{
    nome: string;
    chavePix: string;
  }>({
    nome: "",
    chavePix: "",
  });
  const [copiadoId, setCopiadoId] = useState<string | null>(null);

  const adicionarMorador = () => {
    if (!novoMorador.nome.trim()) {
      Alert.alert("Erro", "Informe o nome do morador.");
      return;
    }

    const novo: Morador = {
      id: Date.now().toString(),
      nome: novoMorador.nome.trim(),
      chavePix: novoMorador.chavePix?.trim() || undefined,
    };

    setRepublica({
      ...republica,
      moradores: [...republica.moradores, novo],
    });

    setNovoMorador({ nome: "", chavePix: "" });
    setAdicionando(false);
    Alert.alert("Sucesso", "Morador adicionado com sucesso!");
  };

  const copiarChavePix = async (morador: Morador) => {
    if (!morador.chavePix) {
      Alert.alert("Erro", "Morador não possui chave PIX cadastrada.");
      return;
    }

    await Clipboard.setStringAsync(morador.chavePix);
    setCopiadoId(morador.id);
    Alert.alert("Copiado", "Chave PIX copiada para a área de transferência.");
    setTimeout(() => setCopiadoId(null), 1500);
  };

  const calcularDividaPorMorador = (moradorId: string) => {
    return republica.contas
      .filter((conta) => !conta.pago)
      .reduce((total, conta) => {
        const resp = conta.responsaveis.find((r) => r.moradorId === moradorId);
        return total + (resp?.valor || 0);
      }, 0);
  };

  const quantidadeContasPendentes = (moradorId: string) => {
    return republica.contas.filter(
      (conta) =>
        !conta.pago && conta.responsaveis.some((r) => r.moradorId === moradorId)
    ).length;
  };

  const renderMorador = ({ item: morador }: { item: Morador }) => {
    const divida = calcularDividaPorMorador(morador.id);
    const qtd = quantidadeContasPendentes(morador.id);
    const isPendente = divida > 0;

    return (
      <View className="rounded-lg bg-white p-4 shadow-sm">
        {/* header */}
        <View className="flex-row items-start justify-between">
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
              <Feather name="user" size={20} color="#4f46e5" />
            </View>

            <View>
              <Text className="text-lg font-semibold">{morador.nome}</Text>
              <Text className="text-sm text-gray-500">
                {qtd} {qtd === 1 ? "conta pendente" : "contas pendentes"}
              </Text>
            </View>
          </View>

          <View>
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
                  onPress={() => copiarChavePix(morador)}
                  className="rounded-md border border-indigo-600 px-3 py-2"
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
    );
  };

  return (
    <View className="space-y-4">
      {/* botão adicionar */}
      {!adicionando ? (
        <TouchableOpacity
          onPress={() => setAdicionando(true)}
          className="mb-5 mt-2 items-center rounded-md bg-indigo-600 py-3"
        >
          <View className="flex-row items-center">
            <Feather name="plus" size={16} color="#fff" />
            <Text className="ml-2 font-medium text-white">
              Adicionar Morador
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
          <View className="mb-3">
            <Text className="text-base font-semibold">Novo Morador</Text>
            <Text className="text-sm text-gray-600">
              Adicione um novo morador à república
            </Text>
          </View>

          <View className="space-y-3">
            <View>
              <Text className="mb-1 text-sm text-gray-700">Nome</Text>
              <TextInput
                value={novoMorador.nome}
                onChangeText={(t) => setNovoMorador((s) => ({ ...s, nome: t }))}
                placeholder="Nome completo"
                className="rounded bg-white px-3 py-2"
              />
            </View>

            <View>
              <Text className="mb-1 text-sm text-gray-700">
                Chave PIX (opcional)
              </Text>
              <TextInput
                value={novoMorador.chavePix}
                onChangeText={(t) =>
                  setNovoMorador((s) => ({ ...s, chavePix: t }))
                }
                placeholder="Email, CPF ou telefone"
                className="rounded bg-white px-3 py-2"
              />
            </View>

            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={adicionarMorador}
                className="flex-1 items-center rounded-md bg-indigo-600 py-3"
              >
                <Text className="font-medium text-white">Salvar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setAdicionando(false);
                  setNovoMorador({ nome: "", chavePix: "" });
                }}
                className="flex-1 items-center rounded-md border border-gray-300 py-3"
              >
                <Text className="font-medium text-gray-700">Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* lista de moradores */}
      <FlatList
        data={republica.moradores}
        keyExtractor={(m) => m.id}
        renderItem={renderMorador}
        ItemSeparatorComponent={() => <View className="h-5" />}
        contentContainerStyle={{ paddingBottom: 130 }}
      />
    </View>
  );
};

export default ResidentsTab;
