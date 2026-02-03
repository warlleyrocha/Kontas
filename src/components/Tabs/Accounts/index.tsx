import { DeleteButton } from "@/src/components/ui/delete-button";
import { formatMounthYear } from "@/src/utils/formats";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import {
  mesesDisponiveis,
  contasMockadas,
  moradoresMock,
  responsavel,
} from "@/src/constants/account.mock";
//import { AddAccountModal } from "../../Modals/AddAccountModal";

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

interface AccountsTabProps {
  readonly onOpenAdd?: () => void;
}

export function AccountsTab({ onOpenAdd }: AccountsTabProps) {
  const [mesSelecionado, setMesSelecionado] = useState<string>("todos");
  const [mostrarContasAbertas, setMostrarContasAbertas] = useState(true);
  const [mostrarContasPagas, setMostrarContasPagas] = useState(false);
  const [expandidaId, setExpandidaId] = useState<string | null>(null);

  // Filtra contas por mês
  const contasFiltradas =
    mesSelecionado === "todos"
      ? contasMockadas
      : contasMockadas.filter(
          (conta) => conta.mesReferencia === mesSelecionado
        );

  // Organiza contas em abertas e pagas
  const contasOrdenadas = {
    abertas: contasFiltradas.filter((conta) => conta.status === "aberta"),
    pagas: contasFiltradas.filter((conta) => conta.status === "paga"),
  };

  const renderContaCard = (conta: Conta) => {
    const vencimento = new Date(conta.vencimento);
    vencimento.setHours(23, 59, 59, 999);
    const hoje = new Date();
    const vencida = vencimento < hoje && !conta.pago;
    const emAberto = vencimento >= hoje && !conta.pago;

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
                  name={
                    conta.pago ? "checkbox-marked" : "checkbox-blank-outline"
                  }
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
                        <Text className="font-bold text-indigo-900">
                          Total:
                        </Text>
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

  if (
    contasOrdenadas.abertas.length === 0 &&
    contasOrdenadas.pagas.length === 0 &&
    mesSelecionado === "todos"
  ) {
    return (
      <TouchableOpacity
        className="mt-6 items-center rounded-lg bg-white p-6 shadow-lg"
        onPress={() => onOpenAdd?.()}
      >
        <Feather name="dollar-sign" size={48} color="#9ca3af" />
        <Text className="mt-4 text-center text-gray-500">
          Nenhuma conta cadastrada ainda.{"\n"}
          Toque para adicionar.
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ paddingVertical: 12 }}>
      {/* Filtro de Mês */}
      <View className="mb-4 px-4">
        <Text className="mb-2 text-sm font-semibold text-gray-700">
          Filtrar por mês:
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          <TouchableOpacity
            onPress={() => setMesSelecionado("todos")}
            className={`rounded-full px-4 py-2 ${
              mesSelecionado === "todos"
                ? "bg-indigo-600"
                : "border border-gray-300 bg-white"
            }`}
          >
            <Text
              className={`font-medium ${
                mesSelecionado === "todos" ? "text-white" : "text-gray-700"
              }`}
            >
              Todos
            </Text>
          </TouchableOpacity>

          {mesesDisponiveis.map((mesAno) => (
            <TouchableOpacity
              key={mesAno}
              onPress={() => setMesSelecionado(mesAno)}
              className={`rounded-full px-4 py-2 ${
                mesSelecionado === mesAno
                  ? "bg-indigo-600"
                  : "border border-gray-300 bg-white"
              }`}
            >
              <Text
                className={`font-medium ${
                  mesSelecionado === mesAno ? "text-white" : "text-gray-700"
                }`}
              >
                {formatMounthYear(mesAno)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Mensagem quando não há contas no mês selecionado */}
      {contasOrdenadas.abertas.length === 0 &&
      contasOrdenadas.pagas.length === 0 &&
      mesSelecionado !== "todos" ? (
        <View className="mx-4 mt-6 items-center rounded-lg bg-white p-6 shadow-sm">
          <Feather name="calendar" size={48} color="#9ca3af" />
          <Text className="mt-4 text-center text-gray-500">
            Nenhuma conta encontrada para {formatMounthYear(mesSelecionado)}.
          </Text>
        </View>
      ) : (
        <View className="px-4">
          {/* Dropdown de Contas em Aberto */}
          {contasOrdenadas.abertas.length > 0 && (
            <View className="mb-4">
              <TouchableOpacity
                onPress={() => setMostrarContasAbertas(!mostrarContasAbertas)}
                className="mb-3 flex-row items-center justify-between rounded-lg bg-blue-50 p-4"
              >
                <Text className="text-lg font-semibold text-blue-800">
                  Em Aberto ({contasOrdenadas.abertas.length})
                </Text>
                <MaterialCommunityIcons
                  name={mostrarContasAbertas ? "chevron-up" : "chevron-down"}
                  size={24}
                  color="#1e40af"
                />
              </TouchableOpacity>

              {mostrarContasAbertas &&
                contasOrdenadas.abertas.map(renderContaCard)}
            </View>
          )}

          {/* Dropdown de Contas Pagas */}
          {contasOrdenadas.pagas.length > 0 && (
            <View className="mb-4">
              <TouchableOpacity
                onPress={() => setMostrarContasPagas(!mostrarContasPagas)}
                className="mb-3 flex-row items-center justify-between rounded-lg bg-green-50 p-4"
              >
                <Text className="text-lg font-semibold text-green-800">
                  Contas Pagas ({contasOrdenadas.pagas.length})
                </Text>
                <MaterialCommunityIcons
                  name={mostrarContasPagas ? "chevron-up" : "chevron-down"}
                  size={24}
                  color="#166534"
                />
              </TouchableOpacity>

              {mostrarContasPagas && contasOrdenadas.pagas.map(renderContaCard)}
            </View>
          )}

          <TouchableOpacity
            className="items-center rounded-md bg-indigo-600 px-4 py-3 mb-2"
            onPress={() => onOpenAdd?.()}
          >
            <Text className="text-white">+ Nova Conta</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal de Edição 
      <AddAccountModal
        visible={showEditModal}
        onClose={fecharEdicao}
        republica={republica}
        setRepublica={setRepublica}
        contaParaEditar={contaParaEditar}
      />*/}
    </ScrollView>
  );
}
