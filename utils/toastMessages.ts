// utils/toastMessages.ts
import { showToast } from "./showToast";

export const toastErrors = {
  logoutFailed() {
    showToast.error("Não foi possível fazer logout. Tente novamente.");
  },

  profileUpdateFailed() {
    showToast.error("Erro ao atualizar o perfil.");
  },

  networkError() {
    showToast.error("Erro de conexão. Verifique sua internet.");
  },
};
