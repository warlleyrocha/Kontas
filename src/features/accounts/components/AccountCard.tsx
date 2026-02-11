import { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useResidents } from "@/src/features/residents/hooks/useResidents";
import type { ContaAdaptada } from "@/src/graphql/types/account";
import type { ResidentResponse } from "@/src/types/resident.types";

interface MoradorConta {
  id: string;
  nome: string;
  pago: boolean;
  valor: number; // Valor definido para este morador na divisão
}

interface AccountCardProps {
  conta: ContaAdaptada;
  republicId: string;
  onDelete?: (accountId: string) => Promise<void>; // se for assíncrona
}

export const AccountCard = ({
  conta,
  republicId,
  onDelete,
}: AccountCardProps) => {
  const { residents, fetchResidents, isLoading } = useResidents();
  const vencimento = new Date(conta.vencimento);
  vencimento.setHours(23, 59, 59, 999);
  const hoje = new Date();
  const paga = conta.status === "paga";
  const vencida = vencimento < hoje && !paga;

  const [expandidaId, setExpandidaId] = useState<string | null>(null);

  // Estado para acompanhar quem já pagou (será atualizado quando o backend retornar os dados)
  const [moradores, setMoradores] = useState<MoradorConta[]>([]);

  // Buscar moradores da república ao montar
  useEffect(() => {
    const loadResidents = async () => {
      await fetchResidents(republicId);
    };
    loadResidents();
  }, [republicId, fetchResidents]);

  // Formatar moradores para exibição
  useEffect(() => {
    if (residents && residents.length > 0) {
      setMoradores(
        residents.map((resident: ResidentResponse) => ({
          id: resident.id,
          nome: resident.nome,
          pago: false, // TODO: Quando o backend retornar, usar dados reais
          valor: 0, // TODO: Quando o backend retornar responsaveis[], usar: responsavel?.valor ?? 0
          // Quando a API retornar com responsaveis[], fazer:
          // pago: responsaveisData?.find(r => r.moradorId === resident.id)?.pago ?? false
          // valor: responsaveisData?.find(r => r.moradorId === resident.id)?.valor ?? 0
        }))
      );
    }
  }, [residents]);

  const toggleMoradorPago = (moradorId: string) => {
    setMoradores((prev) =>
      prev.map((m) => (m.id === moradorId ? { ...m, pago: !m.pago } : m))
    );
  };

  const renderMoradorContent = () => {
    if (isLoading) {
      return (
        <View className="items-center justify-center py-6">
          <ActivityIndicator size="small" color="#4b5563" />
          <Text className="mt-2 text-sm text-gray-500">
            Carregando moradores...
          </Text>
        </View>
      );
    }

    if (moradores.length > 0) {
      return moradores.map((morador, index) => (
        <View
          key={morador.id}
          className={`flex-row items-center justify-between px-4 py-3 ${
            index !== moradores.length - 1 ? "border-b border-gray-200" : ""
          }`}
        >
          <TouchableOpacity
            onPress={() => toggleMoradorPago(morador.id)}
            className="flex-1 flex-row items-center gap-3"
          >
            <MaterialCommunityIcons
              name={morador.pago ? "checkbox-marked" : "checkbox-blank-outline"}
              size={20}
              color={morador.pago ? "#16a34a" : "#6b7280"}
            />
            <View className="flex-1">
              <Text
                className={`text-sm font-medium ${
                  morador.pago ? "text-gray-400 line-through" : "text-gray-700"
                }`}
              >
                {morador.nome}
              </Text>
              {morador.valor > 0 && (
                <Text className="mt-1 text-xs text-gray-500">
                  R$ {morador.valor.toFixed(2).replace(".", ",")}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {morador.pago && (
            <View className="rounded-md bg-green-50 px-2 py-1">
              <Text className="text-xs font-medium text-green-600">Pago</Text>
            </View>
          )}
        </View>
      ));
    }

    return (
      <View className="items-center justify-center py-6">
        <Text className="text-sm text-gray-500">Nenhum morador disponível</Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      key={conta.id}
      onPress={() => console.log("Editar conta", conta.id)}
      activeOpacity={0.7}
    >
      <View
        className={`mb-3 rounded-lg bg-white shadow-sm ${
          vencida ? "border border-orange-300 bg-orange-50" : ""
        }`}
      >
        {/* HEADER: Checkbox + Descrição + Valor */}
        <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
          <TouchableOpacity
            className="flex-1 flex-row items-center gap-2"
            onPress={(e) => {
              e.stopPropagation();
              console.log("Marcar como pago", conta.id);
            }}
          >
            <MaterialCommunityIcons
              name={paga ? "checkbox-marked" : "checkbox-blank-outline"}
              size={24}
              color={paga ? "#16a34a" : "#6b7280"}
            />
            <Text
              className={`flex-1 text-base font-semibold ${
                paga ? "text-gray-400 line-through" : "text-gray-800"
              }`}
            >
              {conta.descricao}
            </Text>
          </TouchableOpacity>

          <Text className="ml-2 font-bold text-indigo-600">
            R$ {conta.valor.toFixed(2)}
          </Text>
        </View>

        {/* INFO SECUNDÁRIAS: Data + Responsável */}
        <View className="border-b border-gray-100 px-4 py-3">
          <View className="flex-row items-center justify-between gap-4">
            {/* Responsável */}
            <View className="rounded-md border border-indigo-600 px-2 py-1">
              <Text className="text-xs text-indigo-600">Responsável: N/A</Text>
            </View>

            {/* Data */}
            <View className="flex-row items-center gap-1">
              <Ionicons name="calendar-outline" size={16} color="#4b5563" />
              <Text className="text-sm text-gray-600">
                {vencimento.toLocaleDateString("pt-BR")}
              </Text>
            </View>
          </View>
        </View>

        {/* MORADORES - DROPDOWN */}
        <View className="border-b border-gray-100">
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              setExpandidaId(expandidaId === conta.id ? null : conta.id);
            }}
            className="flex-row items-center justify-between px-4 py-3"
          >
            <View className="flex-row items-center gap-2">
              <Ionicons name="people-outline" size={18} color="#4b5563" />
              <Text className="font-semibold text-gray-700">Moradores</Text>
              <View className="rounded-full bg-indigo-100 px-2 py-0.5">
                <Text className="text-xs font-semibold text-indigo-600">
                  {isLoading ? "..." : moradores.length}
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons
              name={expandidaId === conta.id ? "chevron-up" : "chevron-down"}
              size={24}
              color="#6b7280"
            />
          </TouchableOpacity>

          {/* CONTEÚDO: Lista de Moradores */}
          {expandidaId === conta.id && (
            <View className="border-t border-gray-100 bg-gray-50">
              {renderMoradorContent()}
            </View>
          )}
        </View>

        {/* FOOTER: Ações */}
        <View className="flex-row gap-2 px-4 py-3">
          {/* Copiar PIX */}
          {!paga && (
            <TouchableOpacity
              onPress={() => console.log("Copiar PIX")}
              className="flex-1 flex-row items-center justify-center rounded-md border border-indigo-600 py-2"
            >
              <Feather name="copy" size={16} color="#4b5563" />
              <Text className="ml-2 text-sm text-gray-700">Copiar PIX</Text>
            </TouchableOpacity>
          )}

          {/* Deletar */}
          <TouchableOpacity
            onPress={() => onDelete?.(conta.id)}
            className="flex-row items-center justify-center rounded-md bg-red-50 px-4 py-2"
          >
            <Feather name="trash-2" size={16} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default AccountCard;
