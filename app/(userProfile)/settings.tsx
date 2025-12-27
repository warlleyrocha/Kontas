import Header from "@/components/Header";
import InputField from "@/components/ui/input-field";
import LoadingScreen from "@/components/ui/loading-screen";
import { useAuth } from "@/contexts/AuthContext";
import { maskPhone } from "@/utils/inputMasks";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

const SettingsScreen = () => {
  const { user, loading, logout } = useAuth();

  if (loading) return <LoadingScreen message="Carregando configurações..." />;

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-lg text-gray-600">Usuário não encontrado.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Header title="Configurações" />
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View className="items-center mb-8">
          <Image
            source={{ uri: user.fotoPerfil || undefined }}
            className="h-24 w-24 rounded-full bg-gray-200 mb-3"
            resizeMode="cover"
          />
          <Text className="font-inter-bold text-xl text-gray-900 mb-1">
            {user.nome}
          </Text>
          <Text className="font-inter-medium text-base text-gray-500">
            {user.email}
          </Text>
        </View>

        <View className="gap-4 mb-8">
          <InputField
            label="Nome"
            value={user.nome}
            onChangeText={() => {}}
            editable={false}
          />
          <InputField
            label="E-mail"
            value={user.email}
            onChangeText={() => {}}
            editable={false}
            keyboardType="email-address"
          />
          <InputField
            label="Telefone"
            value={maskPhone(user.telefone ?? "Não informado")}
            onChangeText={() => {}}
            editable={false}
            keyboardType="phone-pad"
          />
          <InputField
            label="Chave Pix"
            value={user.chavePix ?? "Não informado"}
            onChangeText={() => {}}
            editable={false}
          />
        </View>

        <TouchableOpacity
          className="flex-row items-center justify-center gap-2 rounded-lg bg-red-50 py-3"
          onPress={logout}
        >
          <Feather name="log-out" size={20} color="#dc2626" />
          <Text className="font-inter-semibold text-red-600 text-base">
            Sair da conta
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;
