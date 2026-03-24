import { setStringAsync } from "expo-clipboard";
import { ResidentResponse } from "@/src/shared/types/resident.types";
import { showToast } from "@/src/shared/utils/showToast";

export const useTabResidents = () => {
  const copiarChavePix = async (
    morador: ResidentResponse
  ): Promise<boolean> => {
    if (!morador.chavePix) {
      showToast.error("Morador não possui chave PIX cadastrada.");
      return false;
    }

    try {
      await setStringAsync(morador.chavePix);

      return true;
    } catch {
      showToast.error("Não foi possível copiar a chave PIX.");
      return false;
    }
  };

  return {
    copiarChavePix,
  };
};
