import { useCallback, useEffect, useRef, useState } from "react";

import { getErrorMessage } from "@/src/services/httpError";
import { toast } from "@/src/shared/components/ui/sonner";
import { logger } from "@/src/shared/utils/logger";
import { showToast } from "@/src/shared/utils/showToast";

import { accountResidentsService } from "../services/account-residents.service";
import type {
  CriarContaComMoradoresRequest,
  ListarContasResponse,
  MetodoPagamento,
} from "../types/account.types";
import {
  useCreateAccountMutation,
  useDeleteAccountMutation,
  usePayAccountMutation,
  useRestoreAccountMutation,
} from "./useAccountQueries";

interface UseAccountActionsOptions {
  onRefresh?: () => Promise<unknown> | void;
}

interface UseAccountActionsReturn {
  showAccountModal: boolean;
  setShowAccountModal: (value: boolean) => void;
  isSubmitting: boolean;
  isDeleting: boolean;
  isUpdating: boolean;
  handleSubmit: (data: CriarContaComMoradoresRequest) => Promise<void>;
  handleDelete: (accountId: string) => Promise<void>;
  handlePatch: (
    accountId: string,
    metodoPagamento: MetodoPagamento,
  ) => Promise<void>;
  handleRecovery: (accountId: string) => Promise<void>;
  fetchContasPorMorador: (moradorId: string) => Promise<ListarContasResponse>;
}

export function useAccountActions(
  _options: UseAccountActionsOptions = {},
): UseAccountActionsReturn {
  const [showAccountModal, setShowAccountModal] = useState(false);
  const createAccountMutation = useCreateAccountMutation();
  const deleteAccountMutation = useDeleteAccountMutation();
  const restoreAccountMutation = useRestoreAccountMutation();
  const payAccountMutation = usePayAccountMutation();
  const pendingDeleteTimeoutsRef = useRef<
    Map<string, ReturnType<typeof setTimeout>>
  >(new Map());
  const pendingDeleteToastIdsRef = useRef<Map<string, string | number>>(
    new Map(),
  );

  useEffect(() => {
    const pendingDeleteTimeouts = pendingDeleteTimeoutsRef.current;
    const pendingDeleteToastIds = pendingDeleteToastIdsRef.current;

    return () => {
      pendingDeleteTimeouts.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      pendingDeleteTimeouts.clear();

      pendingDeleteToastIds.forEach((toastId) => {
        toast.dismiss(toastId);
      });
      pendingDeleteToastIds.clear();
    };
  }, []);

  const handleSubmit = useCallback(
    async (data: CriarContaComMoradoresRequest) => {
      try {
        logger.debug("Accounts", "Payload de submit", {
          metodoPagamento: data.metodoPagamento,
        });
        await createAccountMutation.mutateAsync(data);
        setShowAccountModal(false);
        setTimeout(() => {
          showToast.success("Conta criada com sucesso.");
        }, 300);
      } catch (error) {
        showToast.error(
          getErrorMessage(error, "Não foi possível criar a conta."),
        );
      }
    },
    [createAccountMutation],
  );

  const handleRecovery = useCallback(
    async (accountId: string) => {
      const pendingTimeout = pendingDeleteTimeoutsRef.current.get(accountId);
      if (pendingTimeout) {
        clearTimeout(pendingTimeout);
        pendingDeleteTimeoutsRef.current.delete(accountId);

        const toastId = pendingDeleteToastIdsRef.current.get(accountId);
        if (toastId !== undefined) {
          toast.dismiss(toastId);
        }
        pendingDeleteToastIdsRef.current.delete(accountId);

        showToast.success("Remoção cancelada com sucesso.");
        return;
      }

      try {
        await restoreAccountMutation.mutateAsync(accountId);
        showToast.success("Conta recuperada com sucesso.");
      } catch (error) {
        showToast.error(
          getErrorMessage(error, "Não foi possível recuperar a conta."),
        );
      }
    },
    [restoreAccountMutation],
  );

  const handleDelete = useCallback(
    async (accountId: string) => {
      try {
        await deleteAccountMutation.mutateAsync(accountId);
        showToast.success("Conta removida com sucesso.");
      } catch (error) {
        showToast.error(
          getErrorMessage(error, "Não foi possível remover a conta."),
        );
      }
    },
    [deleteAccountMutation],
  );

  const handlePatch = useCallback(
    async (accountId: string, metodoPagamento: MetodoPagamento) => {
      try {
        await payAccountMutation.mutateAsync({ accountId, metodoPagamento });
        showToast.success("Conta marcada como paga com sucesso!");
      } catch (error) {
        showToast.error(
          error instanceof Error ? error.message : "Erro inesperado",
        );
      }
    },
    [payAccountMutation],
  );

  const fetchContasPorMorador = useCallback(
    async (moradorId: string): Promise<ListarContasResponse> => {
      return accountResidentsService.listarContasPorMorador(moradorId);
    },
    [],
  );

  return {
    showAccountModal,
    setShowAccountModal,
    isSubmitting: createAccountMutation.isPending,
    isDeleting:
      deleteAccountMutation.isPending || restoreAccountMutation.isPending,
    isUpdating: payAccountMutation.isPending,
    handleSubmit,
    handleDelete,
    handlePatch,
    handleRecovery,
    fetchContasPorMorador,
  };
}
