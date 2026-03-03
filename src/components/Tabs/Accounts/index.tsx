import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { formatMounthYear } from "@/src/utils/formats";

import { AddAccountModal } from "@/src/features/accounts/components/AddAccountModal";
import { AccountCard } from "@/src/features/accounts/components/AccountCard";
import { useAccountActions } from "@/src/features/accounts/hooks/useAccountActions";
import { useAccountList } from "@/src/features/accounts/hooks/useAccountList";
import { ContaMorador } from "@/src/shared/types/accountResidents.types";
import { useCallback, useEffect, useState } from "react";

interface AccountsTabProps {
  readonly republicId: string;
}

export function AccountsTab({ republicId }: AccountsTabProps) {
  const {
    fetchAccounts,
    fetchAccountResidents,
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
  } = useAccountList({ republicId });

  const { showAccountModal, setShowAccountModal, handleSubmit, handleDelete } =
    useAccountActions({ onRefresh: fetchAccounts });
  const [expandedAccountId, setExpandedAccountId] = useState<string | null>(
    null,
  );
  const [accountResidentsById, setAccountResidentsById] = useState<
    Record<string, ContaMorador[]>
  >({});
  const [loadingResidentsById, setLoadingResidentsById] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    void fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    setAccountResidentsById({});
    setLoadingResidentsById({});
    setExpandedAccountId(null);
  }, [republicId]);

  const handleToggleExpand = useCallback(
    async (accountId: string) => {
      setExpandedAccountId((current) =>
        current === accountId ? null : accountId,
      );

      if (accountResidentsById[accountId] || loadingResidentsById[accountId]) {
        return;
      }

      setLoadingResidentsById((prev) => ({ ...prev, [accountId]: true }));
      try {
        const moradores = await fetchAccountResidents(accountId);
        setAccountResidentsById((prev) => ({
          ...prev,
          [accountId]: moradores,
        }));
      } finally {
        setLoadingResidentsById((prev) => ({ ...prev, [accountId]: false }));
      }
    },
    [accountResidentsById, fetchAccountResidents, loadingResidentsById],
  );

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500">Carregando contas...</Text>
      </View>
    );
  }

  // Error state - mostra erro mas permite adicionar conta
  if (error) {
    console.log(error);
    return (
      <View className="flex-1 px-4">
        {/* Banner de erro */}
        <View className="mt-6 rounded-lg bg-red-50 border border-red-200 p-4">
          <View className="flex-row items-center">
            <Feather name="alert-circle" size={24} color="#ef4444" />
            <Text className="ml-3 flex-1 text-red-600">
              Erro ao carregar contas: {error.message}
            </Text>
          </View>
        </View>

        {/* Estado vazio com opção de adicionar */}
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

        {/* Modal de Adição de conta*/}
        <AddAccountModal
          onSubmit={handleSubmit}
          visible={showAccountModal}
          onClose={() => setShowAccountModal(false)}
          republicId={republicId}
        />
      </View>
    );
  }

  // Estado vazio (sem erro)
  if (
    contasOrdenadas.abertas.length === 0 &&
    contasOrdenadas.pagas.length === 0 &&
    mesSelecionado === "todos"
  ) {
    return (
      <View className="px-4">
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

        {/* Modal de Adição de conta*/}
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
                  <AccountCard
                    key={conta.id}
                    conta={conta}
                    criadoPor={conta.criadoPorId}
                    expanded={expandedAccountId === conta.id}
                    onToggleExpand={() => void handleToggleExpand(conta.id)}
                    moradores={accountResidentsById[conta.id] ?? []}
                    isLoadingMoradores={Boolean(loadingResidentsById[conta.id])}
                    onDelete={handleDelete}
                  />
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
                  <AccountCard
                    key={conta.id}
                    conta={conta}
                    criadoPor={conta.criadoPorId}
                    expanded={expandedAccountId === conta.id}
                    onToggleExpand={() => void handleToggleExpand(conta.id)}
                    moradores={accountResidentsById[conta.id] ?? []}
                    isLoadingMoradores={Boolean(loadingResidentsById[conta.id])}
                    onDelete={handleDelete}
                  />
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
        onSubmit={handleSubmit}
        onClose={() => setShowAccountModal(false)}
        republicId={republicId}
      />
    </ScrollView>
  );
}
