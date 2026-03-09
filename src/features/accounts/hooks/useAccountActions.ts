import { getErrorMessage } from "@/src/services/httpError";
import { showToast } from "@/src/utils/showToast";
import { createElement, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "@/src/components/ui/sonner";
import { AccountRecoveryToast } from "../components";
import { accountService } from "../services/account.service";
import { accountResidentsService } from "../services/account-residents.service";
import type {
  CriarContaComMoradoresRequest,
  MetodoPagamento,
} from "../types/account.types";

const RECOVERY_TOAST_DURATION_MS = 10_000;

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
    metodoPagamento: MetodoPagamento
  ) => Promise<void>;
  handleRecovery: (accountId: string) => Promise<void>;
}

export function useAccountActions({
  onRefresh,
}: UseAccountActionsOptions = {}): UseAccountActionsReturn {
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const pendingDeleteTimeoutsRef = useRef<
    Map<string, ReturnType<typeof setTimeout>>
  >(new Map());
  const pendingDeleteToastIdsRef = useRef<Map<string, string | number>>(
    new Map()
  );

  useEffect(() => {
    return () => {
      pendingDeleteTimeoutsRef.current.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      pendingDeleteTimeoutsRef.current.clear();

      pendingDeleteToastIdsRef.current.forEach((toastId) => {
        toast.dismiss(toastId);
      });
      pendingDeleteToastIdsRef.current.clear();
    };
  }, []);

  const handleSubmit = useCallback(
    async (data: CriarContaComMoradoresRequest) => {
      setIsSubmitting(true);

      try {
        const { moradorIds, ...contaPayload } = data;
        const conta = await accountService.criarConta(contaPayload);

        if (moradorIds.length > 0) {
          await accountResidentsService.vincularMoradores({
            contaId: conta.id,
            moradorIds,
            valorTotal: contaPayload.valor,
          });
        }

        showToast.success("Conta criada com sucesso.");
        setShowAccountModal(false);
        await onRefresh?.();
      } catch (error) {
        showToast.error(
          getErrorMessage(error, "Não foi possível criar a conta.")
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [onRefresh]
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

      setIsDeleting(true);

      try {
        await accountService.restaurarConta(accountId);
        showToast.success("Conta recuperada com sucesso.");
        await onRefresh?.();
      } catch (error) {
        showToast.error(
          getErrorMessage(error, "Não foi possível recuperar a conta.")
        );
      } finally {
        setIsDeleting(false);
      }
    },
    [onRefresh]
  );

  const handleDelete = useCallback(
    async (accountId: string) => {
      if (pendingDeleteTimeoutsRef.current.has(accountId)) {
        return;
      }

      const timeoutId = setTimeout(() => {
        pendingDeleteTimeoutsRef.current.delete(accountId);
        const toastId = pendingDeleteToastIdsRef.current.get(accountId);
        if (toastId !== undefined) {
          toast.dismiss(toastId);
        }
        pendingDeleteToastIdsRef.current.delete(accountId);

        void (async () => {
          setIsDeleting(true);
          try {
            await accountService.removerConta({ id: accountId });
            showToast.success("Conta removida com sucesso.");
            await onRefresh?.();
          } catch (error) {
            showToast.error(
              getErrorMessage(error, "Não foi possível remover a conta.")
            );
          } finally {
            setIsDeleting(false);
          }
        })();
      }, RECOVERY_TOAST_DURATION_MS);

      pendingDeleteTimeoutsRef.current.set(accountId, timeoutId);

      const toastId = toast.custom(
        createElement(AccountRecoveryToast, {
          message: "Conta apagada",
          onRecover: () => {
            void handleRecovery(accountId);
          },
          durationMs: RECOVERY_TOAST_DURATION_MS,
        }),
        { duration: RECOVERY_TOAST_DURATION_MS }
      );
      pendingDeleteToastIdsRef.current.set(accountId, toastId);
    },
    [handleRecovery, onRefresh]
  );

  const handlePatch = useCallback(
    async (accountId: string, metodoPagamento: MetodoPagamento) => {
      setIsUpdating(true);

      try {
        await accountService.pagarConta({ id: accountId, metodoPagamento });

        showToast.success("Conta marcada como paga com sucesso!");
      } catch (error) {
        showToast.error(
          error instanceof Error ? error.message : "Erro inesperado"
        );
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  return {
    showAccountModal,
    setShowAccountModal,
    isSubmitting,
    isDeleting,
    isUpdating,
    handleSubmit,
    handleDelete,
    handlePatch,
    handleRecovery,
  };
}
