// utils/toastMessages.ts
import { showToast } from "./showToast";
import { getErrorMessage } from "@/src/services/httpError";

export const toastErrors = {
  logoutFailed(error?: unknown) {
    showToast.error(
      getErrorMessage(error, "Não foi possível fazer logout. Tente novamente.")
    );
  },

  profileUpdateFailed(error?: unknown) {
    showToast.error(getErrorMessage(error, "Erro ao atualizar o perfil."));
  },

  networkError(error?: unknown) {
    showToast.error(
      getErrorMessage(error, "Erro de conexão. Verifique sua internet.")
    );
  },
};
