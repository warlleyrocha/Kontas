import {
  launchImageLibraryAsync,
  requestMediaLibraryPermissionsAsync,
} from "expo-image-picker";
import { useState } from "react";
import { Alert } from "react-native";
import { getErrorMessage } from "@/src/services/httpError";
import {
  maskPixKeyWrite,
  normalizePixKeyRaw,
} from "@/src/shared/utils/inputMasks";
import { logger } from "@/src/shared/utils/logger";
import { showToast } from "@/src/shared/utils/showToast";

export interface EditProfileFormValues {
  onClose: () => void;
  currentName: string;
  currentPixKey?: string;
  currentPhoto?: string;
  currentPhone?: string;
  onSave: (
    name: string,
    pixKey?: string,
    photo?: string,
    phone?: string
  ) => Promise<void> | void;
}

export function useEditProfile({
  currentName,
  currentPixKey,
  currentPhoto,
  currentPhone,
  onClose,
  onSave,
}: EditProfileFormValues) {
  const [name, setName] = useState(currentName);
  const [photoUri, setPhotoUri] = useState(currentPhoto);
  const [phone, setPhone] = useState(currentPhone ?? "");
  const [isUploading, setIsUploading] = useState(false);

  // Estado interno armazena dígitos puros (ou raw para e-mail/UUID/telefone)
  const [pixKeyRaw, setPixKeyRaw] = useState(
    normalizePixKeyRaw(currentPixKey ?? "")
  );

  // Valor exibido é sempre derivado — máscara nunca aplicada sobre si mesma
  const pixKey = maskPixKeyWrite(pixKeyRaw);

  const setPixKey = (value: string) => setPixKeyRaw(normalizePixKeyRaw(value));

  const handleClose = () => {
    setName(currentName);
    setPixKey(currentPixKey ?? "");
    setPhotoUri(currentPhoto);
    setPhone(currentPhone ?? "");
    setIsUploading(false); // ✅ Reset o estado de loading
    onClose();
  };

  const handleSave = async () => {
    setIsUploading(true);
    try {
      await onSave(name, pixKey, photoUri, phone);
    } catch (error) {
      logger.error("Profile", "Erro ao salvar perfil", error);
      showToast.error(
        getErrorMessage(error, "Não foi possível salvar as alterações.")
      );
    } finally {
      setIsUploading(false);
    }
  };

  const selectPhoto = async () => {
    try {
      const { status } = await requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão necessária",
          "Precisamos de permissão para acessar suas fotos."
        );
        return;
      }
      const result = await launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      logger.error("Profile", "Erro ao selecionar imagem", error);
      showToast.error(
        getErrorMessage(error, "Não foi possível selecionar a imagem.")
      );
    }
  };

  return {
    name,
    setName,
    pixKey,
    setPixKey,
    photoUri,
    setPhotoUri,
    phone,
    setPhone,
    isUploading,
    handleClose,
    handleSave,
    selectPhoto,
  };
}
