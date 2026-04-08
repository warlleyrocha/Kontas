import Feather from "@expo/vector-icons/Feather";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AccountSection,
  AddAccountModal,
  PlusButton,
} from "@/src/features/accounts/components";
import {
  AccountContextMenu,
  type CardPosition,
} from "@/src/features/accounts/components/AccountContextMenu";
import { useAccountsTab } from "@/src/features/accounts/hooks/useAccountsTab";
import type { Conta } from "@/src/features/accounts/types/account.types";
import { StatusPagamento } from "@/src/features/accounts/types/accountResidents.types";
import { getMoradorStatusVisual } from "@/src/features/accounts/utils/accountStatus.utils";
import { useTabResidents } from "@/src/features/residents/hooks/useTabResidents";
import { ToastConfirm } from "@/src/shared/components/ui/toast-custom";
import { useRefresh } from "@/src/shared/contexts/RefreshContext";
import { useComponentLogger } from "@/src/shared/hooks/useComponentLogger";
import type { ResidentResponse } from "@/src/shared/types/resident.types";
import { formatMounthYear } from "@/src/shared/utils/formats";
import { showToast } from "@/src/shared/utils/showToast";

interface AccountsTabProps {
  readonly republicId: string;
  readonly currentResidentId: string | null;
  readonly residents: ResidentResponse[];
  readonly isAdmin?: boolean;
  readonly onPendingPaymentsCountChange?: (count: number) => void;
}

export function AccountsTab({
  republicId,
  currentResidentId,
  residents,
  isAdmin = false,
  onPendingPaymentsCountChange,
}: AccountsTabProps) {
  useComponentLogger("AccountsTab");
  const { copiarChavePix } = useTabResidents();

  const handleCopyPixFromAccount = useCallback(
    async (conta: Conta) => {
      const morador = residents.find((r) => r.id === conta.criadoPorId);
      if (!morador) {
        showToast.error("Não foi possível localizar o responsável pela conta.");
        return false;
      }

      return copiarChavePix(morador);
    },
    [residents, copiarChavePix]
  );

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

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    accountId: string | null;
    position: CardPosition | null;
  }>({ visible: false, accountId: null, position: null });

  const [deleteConfirm, setDeleteConfirm] = useState<{
    visible: boolean;
    accountId: string | null;
    descricao: string;
  }>({ visible: false, accountId: null, descricao: "" });

  const handleAccountLongPress = useCallback(
    (accountId: string, position: CardPosition) => {
      setContextMenu({ visible: true, accountId, position });
    },
    []
  );

  const handleContextMenuClose = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  const handleContextMenuDelete = useCallback(() => {
    handleContextMenuClose();
    if (!contextMenu.accountId) return;
    const accountId = contextMenu.accountId;
    const conta =
      contasOrdenadas.abertas.find((c) => c.id === accountId) ??
      contasOrdenadas.pagas.find((c) => c.id === accountId);
    setDeleteConfirm({
      visible: true,
      accountId,
      descricao: conta?.descricao ?? "esta conta",
    });
  }, [contextMenu.accountId, contasOrdenadas, handleContextMenuClose]);

  const { refreshing, onRefresh } = useRefresh();
  const pendingPaymentsCount = useMemo(
    () =>
      Object.values(accountResidentsById).reduce(
        (total, residents) =>
          total +
          residents.filter(
            (resident) =>
              getMoradorStatusVisual(resident) ===
              StatusPagamento.AGUARDANDO_CONFIRMACAO
          ).length,
        0
      ),
    [accountResidentsById]
  );

  useEffect(() => {
    onPendingPaymentsCountChange?.(pendingPaymentsCount);
  }, [onPendingPaymentsCountChange, pendingPaymentsCount]);

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
          <Feather name="dollar-sign" size={48} color="#337176" />
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
          accessibilityRole="button"
          accessibilityLabel="Adicionar nova conta"
        >
          <Feather name="dollar-sign" size={48} color="#337176" />
          <Text className="mt-4 text-center text-gray-500">
            Nenhuma conta cadastrada ainda.{"\n"}
            Toque no botão para adicionar.
          </Text>
        </TouchableOpacity>

        {showAccountModal && (
          <AddAccountModal
            visible={showAccountModal}
            onSubmit={handleSubmit}
            onClose={closeAccountModal}
            republicId={republicId}
          />
        )}
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
              accessibilityRole="button"
              accessibilityLabel="Mostrar contas de todos os meses"
              accessibilityState={{ selected: mesSelecionado === "todos" }}
              className={`rounded-full px-4 py-2 ${
                mesSelecionado === "todos"
                  ? "bg-teal"
                  : "border border-teal/20 bg-white"
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
                accessibilityRole="button"
                accessibilityLabel={`Mostrar contas de ${formatMounthYear(mesAno)}`}
                accessibilityState={{ selected: mesSelecionado === mesAno }}
                className={`rounded-full px-4 py-2 ${
                  mesSelecionado === mesAno
                    ? "bg-teal"
                    : "border border-teal/20 bg-white"
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
            <Feather name="calendar" size={48} color="#337176" />
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
              headerBg="bg-teal/10"
              headerTextColor="text-teal-dark"
              headerIconColor="#337176"
              expandedAccountId={expandedAccountId}
              onToggleExpand={handleToggleExpand}
              accountResidentsById={accountResidentsById}
              loadingResidentsById={loadingResidentsById}
              errorResidentsById={errorResidentsById}
              updatingResidentById={updatingResidentById}
              currentResidentId={currentResidentId}
              onLongPress={handleAccountLongPress}
              onConfirmResidentPayment={confirmResidentPayment}
              onPatch={handlePatchAndRefresh}
              onCopyPix={handleCopyPixFromAccount}
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
              onLongPress={handleAccountLongPress}
              onConfirmResidentPayment={confirmResidentPayment}
              onPatch={handlePatchAndRefresh}
              onCopyPix={handleCopyPixFromAccount}
            />
          </View>
        )}
      </ScrollView>

      <PlusButton onPress={openAccountModal} />

      {showAccountModal && (
        <AddAccountModal
          visible={showAccountModal}
          onSubmit={handleSubmit}
          onClose={closeAccountModal}
          republicId={republicId}
        />
      )}

      <AccountContextMenu
        visible={contextMenu.visible}
        position={contextMenu.position}
        isAdmin={isAdmin}
        onClose={handleContextMenuClose}
        onEdit={() => {}}
        onDelete={handleContextMenuDelete}
      />

      <Modal
        visible={deleteConfirm.visible}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <SafeAreaView className="flex-1 justify-end pb-[2px]">
          <ToastConfirm
            message={deleteConfirm.descricao}
            duration={8000}
            onConfirm={() => {
              setDeleteConfirm((prev) => ({ ...prev, visible: false }));
              if (deleteConfirm.accountId) {
                void handleDelete(deleteConfirm.accountId);
              }
            }}
            onCancel={() =>
              setDeleteConfirm((prev) => ({ ...prev, visible: false }))
            }
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}
