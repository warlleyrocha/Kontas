import { ResidentResponse } from "@/src/types/resident.types";
import { showToast } from "@/src/utils/showToast";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";

export const useTabResidents = () => {
  const [copiadoId, setCopiadoId] = useState<string | null>(null);

  const copiarChavePix = async (morador: ResidentResponse) => {
    if (!morador.chavePix) {
      showToast.error("Morador não possui chave PIX cadastrada.");
      return;
    }

    await Clipboard.setStringAsync(morador.chavePix);
    setCopiadoId(morador.id);
    showToast.info("Chave copiada para a área de transferência.");
    setTimeout(() => setCopiadoId(null), 1500);
  };

  return {
    // Estados
    copiadoId,

    // Funções utilitárias
    copiarChavePix,
  };
};
