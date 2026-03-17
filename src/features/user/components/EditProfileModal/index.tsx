import Feather from "@expo/vector-icons/Feather";
import type { FC } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { maskPhoneWrite } from "@/src/shared/utils/inputMasks";
import {
  EditProfileFormValues,
  useEditProfile,
} from "../../hooks/useEditProfile";

export interface EditProfileModalProps extends EditProfileFormValues {
  visible: boolean;
  currentPhone?: string;
}

export const EditProfileModal: FC<EditProfileModalProps> = ({
  visible,
  onClose,
  currentName,
  currentPixKey,
  currentPhoto,
  currentPhone,
  onSave,
}) => {
  const {
    name,
    setName,
    pixKey,
    setPixKey,
    photoUri,
    isUploading,
    handleClose,
    handleSave,
    selectPhoto,
    phone,
    setPhone,
  } = useEditProfile({
    currentName,
    currentPixKey,
    currentPhoto,
    currentPhone,
    onClose,
    onSave,
  });
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="rounded-xl bg-white px-6 py-6">
            {/* Header */}
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-lg font-semibold">Editar Perfil</Text>
            </View>

            {/* Foto do Perfil */}
            <TouchableOpacity
              onPress={selectPhoto}
              className="mb-6 items-center"
            >
              <View className="h-28 w-28 items-center justify-center rounded-full bg-indigo-100">
                {photoUri ? (
                  <Image
                    source={{ uri: photoUri }}
                    className="h-28 w-28 rounded-full"
                  />
                ) : (
                  <Feather name="user" size={56} color="#4f46e5" />
                )}
              </View>
              <Text className="mt-2 text-sm text-indigo-600">
                Toque para alterar a foto
              </Text>
            </TouchableOpacity>

            {/* Nome */}
            <View className="mb-4">
              <Text className="mb-2 text-sm font-semibold text-gray-700">
                Nome
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Seu nome"
                className="rounded-lg border border-gray-300 bg-white px-4 py-3"
                editable={!isUploading}
              />
            </View>

            {/* Telefone */}
            <View className="mb-4">
              <Text className="mb-2 text-sm font-semibold text-gray-700">
                Telefone
              </Text>
              <TextInput
                value={phone}
                onChangeText={(t) => setPhone(maskPhoneWrite(t))}
                placeholder="Seu telefone"
                keyboardType="phone-pad"
                className="rounded-lg border border-gray-300 bg-white px-4 py-3"
                editable={!isUploading}
              />
            </View>

            {/* Chave Pix */}
            <View className="mb-4">
              <Text className="mb-2 text-sm font-semibold text-gray-700">
                Chave Pix
              </Text>
              <TextInput
                value={pixKey}
                onChangeText={setPixKey}
                placeholder="Sua chave Pix"
                className="rounded-lg border border-gray-300 bg-white px-4 py-3"
                editable={!isUploading}
              />
            </View>

            {/* Botões de Ação */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleSave}
                className="flex-1 items-center rounded-lg bg-indigo-600 py-3"
              >
                <Text className="font-semibold text-white">Salvar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleClose}
                className="flex-1 items-center rounded-lg border border-gray-300 bg-white py-3"
              >
                <Text className="font-semibold text-gray-700">Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
