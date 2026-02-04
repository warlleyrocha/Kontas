import { formatMounthYear } from "@/src/utils/formats";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import { mesesDisponiveis, contasMockadas } from "@/src/constants/account.mock";
import { AddAccountModal } from "@/src/features/accounts/components/AddAccountModal";
import { AccountCard } from "@/src/features/accounts/components/AccountCard";

interface AccountsTabProps {
  readonly onOpenAdd?: () => void;
}

export function AccountsTab({ onOpenAdd }: AccountsTabProps) {
  const [mesSelecionado, setMesSelecionado] = useState<string>("todos");
  const [mostrarContasAbertas, setMostrarContasAbertas] = useState(true);
  const [mostrarContasPagas, setMostrarContasPagas] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);

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

  if (
    contasOrdenadas.abertas.length === 0 &&
    contasOrdenadas.pagas.length === 0 &&
    mesSelecionado === "todos"
  ) {
    return (
      <TouchableOpacity
        className="mt-6 items-center rounded-lg bg-white p-6 shadow-lg"
        onPress={() => setShowAccountModal(true)}
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
                contasOrdenadas.abertas.map((conta) => (
                  <AccountCard key={conta.id} conta={conta} />
                ))}
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

              {mostrarContasPagas &&
                contasOrdenadas.pagas.map((conta) => (
                  <AccountCard key={conta.id} conta={conta} />
                ))}
            </View>
          )}

          <TouchableOpacity
            className="items-center rounded-md bg-indigo-600 px-4 py-3 mb-2"
            onPress={() => setShowAccountModal(true)}
          >
            <Text className="text-white">+ Nova Conta</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal de Adição de conta*/}
      <AddAccountModal
        visible={showAccountModal}
        onClose={() => setShowAccountModal(false)}
      />
    </ScrollView>
  );
}
