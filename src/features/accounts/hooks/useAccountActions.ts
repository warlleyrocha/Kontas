import { useCallback, useState } from "react";

import { accountService } from "../services/account.service";
import type { CriarContaRequest, StatusConta } from "../types/account.types";
import { showToast } from "@/src/utils/showToast";
import { getErrorMessage } from "@/src/services/httpError";

type StatusContaInput = StatusConta | "Pago" | "Pendente" | "Atrasado";

function normalizeStatus(status: StatusContaInput): StatusConta {
  const normalized = status.toString().trim().toUpperCase();

  if (normalized === "PAGO") return "PAGO" as StatusConta;
  if (normalized === "PENDENTE") return "PENDENTE" as StatusConta;
  if (normalized === "ATRASADO") return "ATRASADO" as StatusConta;

  return "PENDENTE" as StatusConta;
}

export function useAccountActions() {
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const createAccount = useCallback(
    async (payload: Omit<CriarContaRequest, "status"> & { status: StatusContaInput }) => {
      try {
        setIsCreatingAccount(true);

        const account = await accountService.createAccount({
          ...payload,
          status: normalizeStatus(payload.status),
        });

        showToast.success("Conta criada com sucesso");
        return account;
      } catch (error) {
        showToast.error(getErrorMessage(error, "Erro ao criar conta."));
        throw error;
      } finally {
        setIsCreatingAccount(false);
      }
    },
    []
  );

  return {
    createAccount,
    isCreatingAccount,
  };
}
