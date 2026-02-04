import { useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { moradoresMock, responsavel } from "@/src/constants/account.mock";
import { DeleteButton } from "@/src/components/ui/delete-button";

interface Responsavel {
  moradorId: string;
  valor: number;
  pago?: boolean;
}

interface Conta {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string;
  status: string;
  mesReferencia: string;
  responsaveis: Responsavel[];
  pago: boolean;
  pagoEm?: string; // ISO date,
  metodoPagamento?: string;
}

interface AccountCardProps {
  conta: Conta;
}

export const AccountCard = ({ conta }: AccountCardProps) => {
  const vencimento = new Date(conta.vencimento);
  vencimento.setHours(23, 59, 59, 999);
  const hoje = new Date();
  const vencida = vencimento < hoje && !conta.pago;
  const emAberto = vencimento >= hoje && !conta.pago;
  const [expandidaId, setExpandidaId] = useState<string | null>(null);

  // Mock: usando dados fictícios para responsável
  const ownerAccount = responsavel;

  return (
    <TouchableOpacity
      key={conta.id}
      onPress={() => console.log("Editar conta", conta.id)}
      activeOpacity={0.7}
    >
      <View
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
              onPress={(e) => {
                e.stopPropagation();
                console.log("Marcar como pago", conta.id);
              }}
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
              {ownerAccount && (
                <View className="rounded-md border border-indigo-600 px-2 py-1">
                  <Text className="text-xs text-indigo-600">
                    Responsável: {ownerAccount.nome}
                  </Text>
                </View>
              )}

              {/* Em Aberto */}
              {!conta.pago && emAberto && (
                <View className="rounded-md bg-blue-600 px-2 py-1">
                  <Text className="text-xs text-white">Em Aberto</Text>
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

          {/* Valor e Ações à direita */}
          <View className="ml-2 items-end gap-2">
            <DeleteButton
              onPress={() => console.log("Deletar", conta.id)}
              size={18}
            />
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
              onPress={(e) => {
                e.stopPropagation();
                setExpandidaId(expandidaId === conta.id ? null : conta.id);
              }}
              className="flex-row items-center justify-between px-4 py-3"
            >
              <Text className="font-semibold text-gray-700">Divisão:</Text>
              <View className="flex-row items-center gap-2">
                <Text className="text-sm text-gray-500">
                  {conta.responsaveis?.length ?? 0}{" "}
                  {conta.responsaveis?.length === 1 ? "pessoa" : "pessoas"}
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
                    const morador = moradoresMock.find(
                      (m) => m.id === resp.moradorId
                    );

                    return (
                      <View
                        key={resp.moradorId}
                        className="flex-row items-center justify-between rounded-lg bg-white p-3"
                      >
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            console.log(
                              "Marcar responsável como pago",
                              resp.moradorId
                            );
                          }}
                          className="flex-1 flex-row items-center gap-2"
                        >
                          <MaterialCommunityIcons
                            name={
                              resp.pago
                                ? "checkbox-marked"
                                : "checkbox-blank-outline"
                            }
                            size={20}
                            color={resp.pago ? "#16a34a" : "#6b7280"}
                          />
                          <Text
                            className={`font-medium ${
                              resp.pago
                                ? "text-gray-400 line-through"
                                : "text-gray-800"
                            }`}
                          >
                            {morador?.nome}
                          </Text>
                        </TouchableOpacity>
                        <Text
                          className={`font-bold ${
                            resp.pago ? "text-gray-400" : "text-indigo-600"
                          }`}
                        >
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
          {!conta.pago && ownerAccount?.chavePix && (
            <TouchableOpacity
              onPress={() => console.log("Copiar PIX")}
              className="flex-row items-center justify-center rounded-md border border-indigo-600 px-4 py-2"
            >
              <Feather name="copy" size={18} color="#4b5563" />
              <Text className="ml-2 text-gray-700">Copiar Chave PIX</Text>
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
    </TouchableOpacity>
  );
};

export default AccountCard;
