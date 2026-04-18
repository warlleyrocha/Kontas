import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { accountKeys } from "@/src/features/accounts/hooks/account.keys";
import { accountResidentKeys } from "@/src/features/accounts/hooks/accountResident.keys";
import {
  useAccountResidentsByAccountQueries,
  useAccountsByRepublicQuery,
  useConfirmResidentPaymentAdminMutation,
  useRefuseResidentPaymentAdminMutation,
} from "@/src/features/accounts/hooks/useAccountQueries";
import { StatusPagamento } from "@/src/features/accounts/types/accountResidents.types";
import type {
  PaymentAccount,
  PaymentStatusFilter,
} from "@/src/features/accounts/types/payments.types";
import { getMoradorStatusVisual } from "@/src/features/accounts/utils/accountStatus.utils";
import { useResidents } from "@/src/features/residents/hooks/useResidents";
import { useCurrentUserQuery } from "@/src/features/user/hooks/useUserQueries";
import { getErrorMessage } from "@/src/services/httpError";
import { useComponentLogger } from "@/src/shared/hooks/useComponentLogger";
import { ResidentRole } from "@/src/shared/types/resident.types";
import { showToast } from "@/src/shared/utils/showToast";

interface UsePaymentsScreenParams {
  readonly republicId: string;
}

export function usePaymentsScreen({ republicId }: UsePaymentsScreenParams) {
  useComponentLogger("PaymentsScreen");

  const queryClient = useQueryClient();
  const { data: user = null } = useCurrentUserQuery();
  const { residents } = useResidents(republicId);
  const accountsQuery = useAccountsByRepublicQuery(republicId);
  const confirmResidentMutation = useConfirmResidentPaymentAdminMutation();
  const refuseResidentMutation = useRefuseResidentPaymentAdminMutation();

  const currentResident = useMemo(() => {
    if (!user?.email) return null;
    const normalizedEmail = user.email.toLowerCase();
    return residents.find((r) => r.email.toLowerCase() === normalizedEmail);
  }, [residents, user?.email]);

  const isAdmin = currentResident?.role === ResidentRole.ADMIN;
  const currentResidentId = currentResident?.id ?? null;

  const allAccounts = useMemo(
    () => accountsQuery.data ?? [],
    [accountsQuery.data]
  );

  const accounts = useMemo(
    () =>
      isAdmin
        ? allAccounts
        : allAccounts.filter((a) => a.criadoPorId === currentResidentId),
    [allAccounts, isAdmin, currentResidentId]
  );

  const accountIds = useMemo(
    () => accounts.map((account) => account.id),
    [accounts]
  );
  const residentQueries = useAccountResidentsByAccountQueries(
    republicId,
    accountIds
  );
  const [selectedStatus, setSelectedStatus] = useState<PaymentStatusFilter>(
    StatusPagamento.AGUARDANDO_CONFIRMACAO
  );

  const loadPayments = useCallback(
    async (_isManualRefresh = false) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: accountKeys.byRepublic(republicId),
        }),
        queryClient.invalidateQueries({
          queryKey: accountResidentKeys.byRepublic(republicId),
        }),
      ]);
    },
    [queryClient, republicId]
  );

  const paymentAccounts = useMemo(
    () =>
      accounts
        .map((account, index) => {
          const residents = residentQueries.data[index] ?? [];
          const relevantResidents = residents.filter(
            (resident) =>
              getMoradorStatusVisual(resident) ===
                StatusPagamento.AGUARDANDO_CONFIRMACAO ||
              getMoradorStatusVisual(resident) === StatusPagamento.PAGO
          );

          if (relevantResidents.length === 0) {
            return null;
          }

          return {
            ...account,
            residents: relevantResidents,
          };
        })
        .filter((account): account is PaymentAccount => account !== null)
        .sort(
          (firstAccount, secondAccount) =>
            new Date(firstAccount.vencimento).getTime() -
            new Date(secondAccount.vencimento).getTime()
        ),
    [accounts, residentQueries.data]
  );

  const handleConfirmResidentPayment = useCallback(
    async (accountId: string, residentId: string) => {
      try {
        await confirmResidentMutation.mutateAsync({
          accountId,
          accountResidentId: residentId,
        });
        showToast.success("Pagamento marcado como PAGO.");
      } catch (error) {
        showToast.error(
          getErrorMessage(error, "Não foi possível atualizar o pagamento.")
        );
      }
    },
    [confirmResidentMutation]
  );

  const handleRefuseResidentPayment = useCallback(
    async (accountId: string, residentId: string) => {
      try {
        await refuseResidentMutation.mutateAsync({
          accountId,
          accountResidentId: residentId,
        });
        showToast.success("Pagamento recusado.");
      } catch (error) {
        showToast.error(
          getErrorMessage(error, "Não foi possível recusar o pagamento.")
        );
      }
    },
    [refuseResidentMutation]
  );

  const filteredPaymentAccounts = useMemo(
    () =>
      paymentAccounts
        .map((account) => {
          if (selectedStatus === "todos") {
            return account;
          }

          const filteredResidents = account.residents.filter(
            (resident) => getMoradorStatusVisual(resident) === selectedStatus
          );

          if (filteredResidents.length === 0) {
            return null;
          }

          return {
            ...account,
            residents: filteredResidents,
          };
        })
        .filter((account): account is PaymentAccount => account !== null),
    [paymentAccounts, selectedStatus]
  );

  const filteredResidentsCount = useMemo(
    () =>
      filteredPaymentAccounts.reduce(
        (total, account) => total + account.residents.length,
        0
      ),
    [filteredPaymentAccounts]
  );

  const subtitle = useMemo(() => {
    if (selectedStatus === StatusPagamento.PAGO) {
      if (filteredResidentsCount === 0)
        return "Nenhum pagamento marcado como PAGO";
      if (filteredResidentsCount === 1) return "1 pagamento marcado como PAGO";
      return `${filteredResidentsCount} pagamentos marcados como PAGO`;
    }

    if (selectedStatus === StatusPagamento.AGUARDANDO_CONFIRMACAO) {
      if (filteredResidentsCount === 0)
        return "Nenhum pagamento aguardando confirmação";
      if (filteredResidentsCount === 1)
        return "1 pagamento aguardando confirmação";
      return `${filteredResidentsCount} pagamentos aguardando confirmação`;
    }

    if (filteredResidentsCount === 0) return "Nenhum pagamento encontrado";
    if (filteredResidentsCount === 1) return "1 pagamento encontrado";
    return `${filteredResidentsCount} pagamentos encontrados`;
  }, [filteredResidentsCount, selectedStatus]);

  const statusOptions: { label: string; value: PaymentStatusFilter }[] = [
    { label: "Pendentes", value: StatusPagamento.AGUARDANDO_CONFIRMACAO },
    { label: "Pago", value: StatusPagamento.PAGO },
    { label: "Todos", value: "todos" },
  ];

  return {
    error: accountsQuery.error instanceof Error ? accountsQuery.error : null,
    isLoading:
      accountsQuery.isLoading ||
      (residentQueries.isLoading && residentQueries.data.length === 0),
    isRefreshing:
      accountsQuery.isRefetching ||
      (residentQueries.isFetching && residentQueries.data.length > 0),
    filteredPaymentAccounts,
    selectedStatus,
    subtitle,
    statusOptions,
    loadPayments,
    handleConfirmResidentPayment,
    handleRefuseResidentPayment,
    setSelectedStatus,
  };
}
