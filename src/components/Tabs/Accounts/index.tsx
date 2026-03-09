import { Feather } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { formatMounthYear } from "@/src/utils/formats";
import { useAccountActions } from "@/src/features/accounts/hooks/useAccountActions";
import { useAccountExpansion } from "@/src/features/accounts/hooks/useAccountExpansion";
import { useAccountList } from "@/src/features/accounts/hooks/useAccountList";
import {
  AccountSection,
  AddAccountButton,
  AddAccountModal,
} from "@/src/features/accounts/components";

interface AccountsTabProps {
  readonly republicId: string;
}

export function AccountsTab({ republicId }: AccountsTabProps) {
  const {
    refresh,
    contasOrdenadas,
    mesesDisponiveis,
    mesSelecionado,
    mostrarContasAbertas,
    mostrarContasPagas,
    loading,
    error,
    setMesSelecionado,
    setMostrarContasPagas,
    setMostrarContasAbertas,
    accountResidentsById,
    loadingResidentsById,
    errorResidentsById,
    updatingResidentById,
    confirmResidentPayment,
  } = useAccountList({ republicId });

  const { expandedAccountId, handleToggleExpand } = useAccountExpansion({
    republicId,
  });

  const {
    showAccountModal,
    setShowAccountModal,
    handleSubmit,
    handleDelete,
    handlePatch,
  } =
    useAccountActions({ onRefresh: refresh });

  const handlePatchAndRefresh = async (
    accountId: string,
    metodoPagamento: Parameters<typeof handlePatch>[1],
  ) => {
    await handlePatch(accountId, metodoPagamento);
    await refresh();
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500">Carregando contas...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 px-4">
        <View className="mt-6 rounded-lg bg-red-50 border border-red-200 p-4">
          <View className="flex-row items-center">
            <Feather name="alert-circle" size={24} color="#ef4444" />
            <Text className="ml-3 flex-1 text-red-600">
              Erro ao carregar contas: {error.message}
            </Text>
          </View>
        </View>

        <View className="mt-6 items-center rounded-lg bg-white p-6 shadow-lg">
          <Feather name="dollar-sign" size={48} color="#9ca3af" />
          <Text className="mt-4 text-center text-gray-500">
            Nenhuma conta cadastrada ainda.{"\n"}
            Toque no botão para adicionar.
          </Text>
        </View>
      </View>
    );
  }

  if (
    contasOrdenadas.abertas.length === 0 &&
    contasOrdenadas.pagas.length === 0 &&
    mesSelecionado === "todos"
  ) {
    return (
      <View className="flex-1 px-4">
        <TouchableOpacity
          className="mt-6 items-center rounded-lg bg-white p-6 shadow-lg"
          onPress={() => setShowAccountModal(true)}
        >
          <Feather name="dollar-sign" size={48} color="#9ca3af" />
          <Text className="mt-4 text-center text-gray-500">
            Nenhuma conta cadastrada ainda.{"\n"}
            Toque no botão para adicionar.
          </Text>
        </TouchableOpacity>

        <AddAccountModal
          visible={showAccountModal}
          onSubmit={handleSubmit}
          onClose={() => setShowAccountModal(false)}
          republicId={republicId}
        />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <ScrollView
        contentContainerStyle={{ paddingVertical: 12, paddingBottom: 88 }}
      >
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
            {/* Contas em Aberto */}
            <AccountSection
              label="Em Aberto"
              contas={contasOrdenadas.abertas}
              visivel={mostrarContasAbertas}
              onToggle={() => setMostrarContasAbertas(!mostrarContasAbertas)}
              headerBg="bg-blue-50"
              headerTextColor="text-blue-800"
              headerIconColor="#1e40af"
              expandedAccountId={expandedAccountId}
              onToggleExpand={handleToggleExpand}
              accountResidentsById={accountResidentsById}
              loadingResidentsById={loadingResidentsById}
              errorResidentsById={errorResidentsById}
              updatingResidentById={updatingResidentById}
              onConfirmResidentPayment={confirmResidentPayment}
              onDelete={handleDelete}
              onPatch={handlePatchAndRefresh}
            />

            {/* Contas Pagas */}
            <AccountSection
              label="Contas Pagas"
              contas={contasOrdenadas.pagas}
              visivel={mostrarContasPagas}
              onToggle={() => setMostrarContasPagas(!mostrarContasPagas)}
              headerBg="bg-green-50"
              headerTextColor="text-green-800"
              headerIconColor="#166534"
              expandedAccountId={expandedAccountId}
              onToggleExpand={handleToggleExpand}
              accountResidentsById={accountResidentsById}
              loadingResidentsById={loadingResidentsById}
              errorResidentsById={errorResidentsById}
              updatingResidentById={updatingResidentById}
              onConfirmResidentPayment={confirmResidentPayment}
              onDelete={handleDelete}
              onPatch={handlePatchAndRefresh}
            />
          </View>
        )}
      </ScrollView>

      <AddAccountButton onPress={() => setShowAccountModal(true)} />

      <AddAccountModal
        visible={showAccountModal}
        onSubmit={handleSubmit}
        onClose={() => setShowAccountModal(false)}
        republicId={republicId}
      />
    </View>
  );
}
