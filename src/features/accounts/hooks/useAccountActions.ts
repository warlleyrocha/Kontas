import { getErrorMessage } from "@/src/services/httpError";
import { showToast } from "@/src/utils/showToast";
import { useCallback, useState } from "react";
import { accountService } from "../services/account.service";
import type { CriarContaComMoradoresRequest } from "../types/account.types";

interface UseAccountActionsOptions {
  onRefresh?: () => Promise<unknown> | void;
}

export function useAccountActions({
  onRefresh,
}: UseAccountActionsOptions = {}) {
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = useCallback(
    async (data: CriarContaComMoradoresRequest) => {
      setIsSubmitting(true);

      try {
        const { moradorIds, ...contaPayload } = data;
        const conta = await accountService.criarConta(contaPayload);

        if (moradorIds.length > 0) {
          await accountService.vincularMoradores({
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

  return {
    showAccountModal,
    setShowAccountModal,
    isSubmitting,
    isDeleting,
    handleSubmit,
    handleDelete,
  };
}
