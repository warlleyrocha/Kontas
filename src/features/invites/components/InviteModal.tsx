import Feather from "@expo/vector-icons/Feather";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { InviteRequest } from "@/src/features/invites/types/invite.types";

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  republicaId: string;
  sendInvite: (payload: InviteRequest) => Promise<any>;
  loading: boolean;
  error: string | null;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@.]+\.[^\s@]+$/;

const validateEmail = (value: string): string => {
  if (!value.trim()) return "Email é obrigatório";
  if (!EMAIL_REGEX.test(value.trim())) return "Formato de email inválido";
  return "";
};

export const InviteModal: React.FC<InviteModalProps> = ({
  open,
  onClose,
  republicaId,
  sendInvite,
  loading,
  error,
}) => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [touched, setTouched] = useState(false);

  const handleChangeEmail = (value: string) => {
    setEmail(value);
    if (touched) setEmailError(validateEmail(value));
  };

  const handleBlur = () => {
    setTouched(true);
    setEmailError(validateEmail(email));
  };

  const handleClose = () => {
    setEmail("");
    setEmailError("");
    setTouched(false);
    onClose();
  };

  const handleSubmit = async () => {
    setTouched(true);
    const validationError = validateEmail(email);
    if (validationError) {
      setEmailError(validationError);
      return;
    }

    await sendInvite({ email: email.trim(), republicaId });
    handleClose();
  };

  return (
    <Modal
      visible={open}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View className="flex-1 justify-end bg-black/40">
          <SafeAreaView className="rounded-t-2xl bg-white px-6 py-6">
            {/* Header */}
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-xl font-semibold">Enviar convite</Text>
              <TouchableOpacity
                onPress={handleClose}
                accessibilityRole="button"
                accessibilityLabel="Fechar modal de convite"
              >
                <Feather name="x" size={24} color="#337176" />
              </TouchableOpacity>
            </View>

            {/* Email */}
            <View className="mb-6">
              <Text className="mb-2 text-sm font-semibold text-gray-700">
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={handleChangeEmail}
                onBlur={handleBlur}
                placeholder="Email do convidado"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                keyboardType="email-address"
                returnKeyType="send"
                onSubmitEditing={handleSubmit}
                className={`rounded-lg border bg-white px-4 py-3 ${
                  emailError && touched ? "border-red-400" : "border-gray-300"
                }`}
              />
              {touched && emailError ? (
                <Text className="mt-1 text-xs text-red-500">{emailError}</Text>
              ) : null}
              {error ? (
                <Text className="mt-1 text-xs text-red-500">{error}</Text>
              ) : null}
            </View>

            {/* Botões */}
            <View className="flex-row gap-3 pb-6">
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel="Enviar convite"
                className="flex-1 items-center rounded-lg bg-teal py-3"
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "white", fontWeight: "600" }}>
                    Enviar convite
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleClose}
                accessibilityRole="button"
                accessibilityLabel="Cancelar envio de convite"
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
