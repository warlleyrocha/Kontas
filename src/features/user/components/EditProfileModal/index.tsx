import Feather from "@expo/vector-icons/Feather";
import type { FC } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
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
import { maskPhoneWrite, maskPixKeyWrite } from "@/src/shared/utils/inputMasks";
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

  function getPixKeyMaxLength(value: string): number {
    if (value.includes("@")) return 77; // e-mail (RFC 5321)
    if (value.startsWith("+")) return 19; // +55 (11) 99999-9999
    if (/[a-zA-Z]/.test(value)) return 36; // UUID chave aleatória
    const digits = value.replace(/\D/g, "");
    return digits.length <= 11 ? 14 : 18; // CPF (14 c/ máscara) ou CNPJ (18)
  }

  function getPixKeyboardType(
    value: string
  ): "default" | "email-address" | "phone-pad" | "number-pad" {
    if (value.includes("@") || /[a-zA-Z]/.test(value)) return "default";
    if (value.startsWith("+")) return "phone-pad";
    return "number-pad"; // CPF / CNPJ
  }

  function getPixKeyType(value: string): string {
    if (!value) return "";
    if (value.includes("@")) return "E-mail";
    if (value.startsWith("+")) return "Telefone";
    if (/[a-zA-Z]/.test(value)) return "Chave aleatória";
    const digits = value.replace(/\D/g, "");
    return digits.length <= 11 ? "CPF" : "CNPJ";
  }
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 justify-end bg-black/40">
          <SafeAreaView className="rounded-xl bg-white px-6 py-6">
            {/* Header */}
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-lg font-semibold">Editar Perfil</Text>
            </View>

            {/* Foto do Perfil */}
            <TouchableOpacity
              onPress={selectPhoto}
              accessibilityRole="button"
              accessibilityLabel="Alterar foto de perfil"
              className="mb-6 items-center"
            >
              <View className="h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-teal/40 bg-teal/10">
                {photoUri ? (
                  <Image
                    source={{ uri: photoUri }}
                    className="h-28 w-28 rounded-full"
                  />
                ) : (
                  <Feather name="user" size={56} color="#337176" />
                )}
              </View>
              <Text className="mt-2 text-sm text-teal">
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
                maxLength={getPixKeyMaxLength(pixKey)}
                onChangeText={(t) => setPixKey(maskPixKeyWrite(t))}
                placeholder="CPF, CNPJ, telefone, e-mail ou chave aleatória"
                keyboardType={getPixKeyboardType(pixKey)}
                autoCapitalize="none"
                autoCorrect={false}
                className="rounded-lg border border-gray-300 bg-white px-4 py-3"
                editable={!isUploading}
              />
              {pixKey ? (
                <Text className="mt-1 text-xs text-teal">
                  {getPixKeyType(pixKey)}
                </Text>
              ) : null}
            </View>

            {/* Botões de Ação */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleSave}
                accessibilityRole="button"
                accessibilityLabel="Salvar perfil"
                className="flex-1 items-center rounded-lg bg-teal py-3"
              >
                <Text className="font-semibold text-white">Salvar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleClose}
                accessibilityRole="button"
                accessibilityLabel="Cancelar edição de perfil"
                className="flex-1 items-center rounded-lg border border-gray-300 bg-white py-3"
              >
                <Text className="font-semibold text-gray-700">Cancelar</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
