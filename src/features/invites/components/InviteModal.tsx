import type { InviteRequest } from "@/src/features/invites/types/invite.types";
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

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  republicaId: string;
  sendInvite: (payload: InviteRequest) => Promise<any>;
  loading: boolean;
  error: string | null;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  open,
  onClose,
  republicaId,
  sendInvite,
  loading,
  error,
}) => {
  const [email, setEmail] = useState("");

  const handleSubmit = async () => {
    if (!email.trim()) return;

    await sendInvite({
      email: email.trim(),
      republicaId,
    });

    setEmail("");
    onClose(); // opcional — fecha após envio
  };
  return (
    <Modal
      visible={open}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="rounded-t-2xl bg-white px-6 py-6">
            {/* Header */}
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-xl font-semibold">Enviar convite</Text>
              <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* Email */}
            <View className="mb-6">
              <Text className="mb-2 text-sm font-semibold text-gray-700">
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email do convidado"
                autoCapitalize="none"
                keyboardType="email-address"
                className="rounded-lg border border-gray-300 bg-white px-4 py-3"
              />
              {error && (
                <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text>
              )}
            </View>

            {/* Botões */}
            <View className="flex-row gap-3 pb-6">
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                className="flex-1 items-center rounded-lg bg-indigo-600 py-3"
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
                onPress={onClose}
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
