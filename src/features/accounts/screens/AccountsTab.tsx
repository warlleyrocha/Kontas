import { Feather } from "@expo/vector-icons";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  AccountSection,
  AddAccountButton,
  AddAccountModal,
} from "@/src/features/accounts/components";
import { useAccountsTab } from "@/src/features/accounts/hooks/useAccountsTab";
import { useRefresh } from "@/src/shared/contexts/RefreshContext";
import { formatMounthYear } from "@/src/utils/formats";

interface AccountsTabProps {
  readonly republicId: string;
  readonly currentResidentId: string | null;
}

export function AccountsTab({
  republicId,
  currentResidentId,
}: AccountsTabProps) {
  const {
    accountResidentsById,
    closeAccountModal,
    confirmResidentPayment,
    contasOrdenadas,
    error,
    errorResidentsById,
    expandedAccountId,
    handleDelete,
    handlePatchAndRefresh,
    handleSubmit,
    handleToggleExpand,
    hasNoAccounts,
    loading,
    loadingResidentsById,
    mesSelecionado,
    mesesDisponiveis,
    mostrarContasAbertas,
    mostrarContasPagas,
    openAccountModal,
    setMesSelecionado,
    showAccountModal,
    toggleOpenAccounts,
    togglePaidAccounts,
    updatingResidentById,
  } = useAccountsTab({ republicId });

  const { refreshing, onRefresh } = useRefresh();

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
        <View className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
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

  if (hasNoAccounts && mesSelecionado === "todos") {
    return (
      <View className="flex-1 px-4">
        <TouchableOpacity
          className="mt-6 items-center rounded-lg bg-white p-6 shadow-lg"
          onPress={openAccountModal}
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
          onClose={closeAccountModal}
          republicId={republicId}
        />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <ScrollView
        contentContainerStyle={{ paddingVertical: 12, paddingBottom: 88 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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

        {hasNoAccounts && mesSelecionado !== "todos" ? (
          <View className="mx-4 mt-6 items-center rounded-lg bg-white p-6 shadow-sm">
            <Feather name="calendar" size={48} color="#9ca3af" />
            <Text className="mt-4 text-center text-gray-500">
              Nenhuma conta encontrada para {formatMounthYear(mesSelecionado)}.
            </Text>
          </View>
        ) : (
          <View className="px-4">
            <AccountSection
              label="Em Aberto"
              contas={contasOrdenadas.abertas}
              visivel={mostrarContasAbertas}
              onToggle={toggleOpenAccounts}
              headerBg="bg-blue-50"
              headerTextColor="text-blue-800"
              headerIconColor="#1e40af"
              expandedAccountId={expandedAccountId}
              onToggleExpand={handleToggleExpand}
              accountResidentsById={accountResidentsById}
              loadingResidentsById={loadingResidentsById}
              errorResidentsById={errorResidentsById}
              updatingResidentById={updatingResidentById}
              currentResidentId={currentResidentId}
              onConfirmResidentPayment={confirmResidentPayment}
              onDelete={handleDelete}
              onPatch={handlePatchAndRefresh}
            />

            <AccountSection
              label="Contas Pagas"
              contas={contasOrdenadas.pagas}
              visivel={mostrarContasPagas}
              onToggle={togglePaidAccounts}
              headerBg="bg-green-50"
              headerTextColor="text-green-800"
              headerIconColor="#166534"
              expandedAccountId={expandedAccountId}
              onToggleExpand={handleToggleExpand}
              accountResidentsById={accountResidentsById}
              loadingResidentsById={loadingResidentsById}
              errorResidentsById={errorResidentsById}
              updatingResidentById={updatingResidentById}
              currentResidentId={currentResidentId}
              onConfirmResidentPayment={confirmResidentPayment}
              onDelete={handleDelete}
              onPatch={handlePatchAndRefresh}
            />
          </View>
        )}
      </ScrollView>

      <AddAccountButton onPress={openAccountModal} />

      <AddAccountModal
        visible={showAccountModal}
        onSubmit={handleSubmit}
        onClose={closeAccountModal}
        republicId={republicId}
      />
    </View>
  );
}
