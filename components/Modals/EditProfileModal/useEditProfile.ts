import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert } from "react-native";

export interface EditProfileFormValues {
  onClose: () => void;
  currentName: string;
  currentEmail: string;
  currentPixKey?: string;
  currentPhoto?: string;
  currentPhone?: string;
  onSave: (
    name: string,
    email: string,
    pixKey?: string,
    photo?: string,
    phone?: string
  ) => void;
}

export function useEditProfile({
  currentName,
  currentEmail,
  currentPixKey,
  currentPhoto,
  currentPhone,
  onClose,
  onSave,
}: EditProfileFormValues) {
  const [name, setName] = useState(currentName);
  const [email, setEmail] = useState(currentEmail);
  const [pixKey, setPixKey] = useState(currentPixKey ?? "");
  const [photoUri, setPhotoUri] = useState(currentPhoto);
  const [phone, setPhone] = useState(currentPhone ?? "");
  const [isUploading, setIsUploading] = useState(false);

  const handleClose = () => {
    setName(currentName);
    setEmail(currentEmail);
    setPixKey(currentPixKey ?? "");
    setPhotoUri(currentPhoto);
    setPhone(currentPhone ?? "");
    setIsUploading(false); // ✅ Reset o estado de loading
    onClose();
  };

  const handleSave = async () => {
    setIsUploading(true);
    try {
      onSave(name, email, pixKey, photoUri, phone);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    } finally {
      setIsUploading(false);
    }
  };

  const selectPhoto = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão necessária",
          "Precisamos de permissão para acessar suas fotos."
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Erro ao selecionar imagem:", error);
      Alert.alert("Erro", "Não foi possível selecionar a imagem.");
    }
  };

  return {
    name,
    setName,
    email,
    setEmail,
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
