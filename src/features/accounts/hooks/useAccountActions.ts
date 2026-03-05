import { getErrorMessage } from "@/src/services/httpError";
import { showToast } from "@/src/utils/showToast";
import { useCallback, useState } from "react";
import { accountService } from "../services/account.service";
import { accountResidentsService } from "../services/account-residents.service";
import type {
  CriarContaComMoradoresRequest,
  MetodoPagamento,
} from "../types/account.types";

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
}

export function useAccountActions({
  onRefresh,
}: UseAccountActionsOptions = {}): UseAccountActionsReturn {
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

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
          getErrorMessage(error, "Não foi possível criar a conta."),
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [onRefresh],
  );

  const handleDelete = useCallback(
    async (accountId: string) => {
      setIsDeleting(true);

      try {
        await accountService.removerConta({ id: accountId });
        showToast.success("Conta removida com sucesso.");
        await onRefresh?.();
      } catch (error) {
        showToast.error(
          getErrorMessage(error, "Não foi possível remover a conta."),
        );
      } finally {
        setIsDeleting(false);
      }
    },
    [onRefresh],
  );

  const handlePatch = useCallback(
    async (accountId: string, metodoPagamento: MetodoPagamento) => {
      setIsUpdating(true);

      try {
        await accountService.pagarConta({ id: accountId, metodoPagamento });

        showToast.success("Conta marcada como paga com sucesso!");
      } catch (error) {
        showToast.error(
          error instanceof Error ? error.message : "Erro inesperado",
        );
      } finally {
        setIsUpdating(false);
      }
    },
    [],
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
  };
}
