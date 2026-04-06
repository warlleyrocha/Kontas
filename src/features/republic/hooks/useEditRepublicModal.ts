import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  launchImageLibraryAsync,
  requestMediaLibraryPermissionsAsync,
} from "expo-image-picker";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { getErrorMessage } from "@/src/services/httpError";
import { logger } from "@/src/shared/utils/logger";
import { showToast } from "@/src/shared/utils/showToast";

interface UseEditRepublicModalParams {
  visible: boolean;
  onClose?: () => void;
  currentName: string;
  currentImage?: string;
  onSave: (name: string, image?: string) => void;
}

export interface UseEditRepublicModalReturn {
  nome: string;
  setNome: (s: string) => void;
  imagemUri: string | undefined;
  setImagemUri: (s: string | undefined) => void;
  isUploading: boolean;
  limpar: () => void;
  salvar: () => Promise<void>;
  selecionarImagem: () => Promise<void>;
  removerImagem: () => void;
}

/**
 * Hook para gerenciar o estado e lógica do modal de edição da república
 */
export default function useEditRepublicModal({
  visible,
  onClose,
  currentName,
  currentImage,
  onSave,
}: UseEditRepublicModalParams): UseEditRepublicModalReturn {
  const [nome, setNome] = useState(currentName);
  const [imagemUri, setImagemUri] = useState<string | undefined>(currentImage);
  const [isUploading, setIsUploading] = useState(false);

  // Atualizar valores quando o modal abrir com novos dados
  useEffect(() => {
    if (visible) {
      setNome(currentName);
      setImagemUri(currentImage);
    }
  }, [visible, currentName, currentImage]);

  const limpar = () => {
    setNome(currentName);
    setImagemUri(currentImage);
  };

  const selecionarImagem = async () => {
    try {
      // Solicitar permissão
      const { status } = await requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permissão necessária",
          "Precisamos de permissão para acessar suas fotos."
        );
        return;
      }

      // Abrir seletor de imagens
      const result = await launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImagemUri(result.assets[0].uri);
      }
    } catch (error) {
      logger.error("Republic", "Erro ao selecionar imagem", error);
      showToast.error(
        getErrorMessage(error, "Não foi possível selecionar a imagem.")
      );
    }
  };

  const removerImagem = () => {
    setImagemUri(undefined);
  };

  const salvar = async () => {
    try {
      if (!nome.trim()) {
        Alert.alert("Atenção", "Por favor, informe o nome da república.");
        return;
      }

      setIsUploading(true);

      // Salvar imagem no AsyncStorage
      if (imagemUri) {
        await AsyncStorage.setItem("@republica_imagem", imagemUri);
      } else {
        await AsyncStorage.removeItem("@republica_imagem");
      }

      // Chamar callback de salvamento
      onSave(nome.trim(), imagemUri);

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Erro ao salvar dados da república:", error);
      showToast.error(
        getErrorMessage(error, "Não foi possível salvar as alterações.")
      );
    } finally {
      setIsUploading(false);
    }
  };

  return {
    nome,
    setNome,
    imagemUri,
    setImagemUri,
    isUploading,
    limpar,
    salvar,
    selecionarImagem,
    removerImagem,
  };
}
