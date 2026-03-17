import { setStringAsync } from "expo-clipboard";
import { ResidentResponse } from "@/src/shared/types/resident.types";
import { showToast } from "@/src/shared/utils/showToast";

export const useTabResidents = () => {
  const copiarChavePix = async (morador: ResidentResponse) => {
    if (!morador.chavePix) {
      showToast.error("Morador não possui chave PIX cadastrada.");
      return;
    }

    await setStringAsync(morador.chavePix);
    showToast.info("Chave copiada para a área de transferência.");
  };

  return {
    copiarChavePix,
  };
};
