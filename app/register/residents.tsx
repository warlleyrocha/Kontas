import Header from "@/components/Header";
import InputField from "@/components/ui/input-field";
import { useAuth } from "@/contexts";
import type { Republica } from "@/types/resume";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Residents() {
  const { user } = useAuth();
  const router = useRouter();

  // Inicializa os campos com os dados do usuário logado
  const [residentName, setResidentName] = useState(user?.user?.name ?? "");
  const [pixKey, setPixKey] = useState(user?.user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [residentPhoto, setResidentPhoto] = useState<string | undefined>(
    user?.user?.photo ?? undefined
  );
  const [republicName, setRepublicName] = useState("");
  const [republicImage, setRepublicImage] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    const loadTempData = async () => {
      const nome = await AsyncStorage.getItem("@temp_republica_nome");
      const imagem = await AsyncStorage.getItem("@temp_republica_imagem");

      if (nome) setRepublicName(nome);
      if (imagem) setRepublicImage(imagem);
    };
    loadTempData();
  }, []);

  const handleSelectImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permissão necessária",
          "É necessário permitir o acesso à galeria para selecionar uma imagem"
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
        setResidentPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error selecting image:", error);
      Alert.alert("Erro", "Não foi possível selecionar a imagem");
    }
  };

  const handlePress = async () => {
    if (!residentName.trim()) {
      Alert.alert("Atenção", "Preencha o nome do morador para continuar");
      return;
    }
    try {
      const republica: Republica = {
        nome: republicName,
        imagemRepublica: republicImage,
        moradores: [
          {
            id: user?.user?.id ?? Date.now().toString(),
            nome: residentName,
            chavePix: pixKey || undefined,
            telefone: phone || undefined,
            fotoPerfil: residentPhoto ?? undefined,
          },
        ],
        contas: [],
      };
      await AsyncStorage.setItem("@republica_data", JSON.stringify(republica));
      if (republicImage) {
        await AsyncStorage.setItem("@republica_imagem", republicImage);
      }
      await AsyncStorage.removeItem("@temp_republica_nome");
      await AsyncStorage.removeItem("@temp_republica_imagem");
      router.replace("/home");
    } catch (error) {
      console.error("Error saving republic data:", error);
      Alert.alert("Erro", "Não foi possível salvar. Tente novamente.");
    }
  };

  return (
    <View className="flex-1 bg-white px-4 pt-6">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Cabeçalho */}
        <Header title="Registrar Morador" />

        {/* Formulário */}
        <View className="mb-6 flex-col gap-3">
          {/* Seleção de Imagem */}
          <View className="mb-6 w-full items-center">
            <TouchableOpacity
              onPress={handleSelectImage}
              className="items-center"
            >
              <View className="h-32 w-32 items-center justify-center rounded-full bg-gray-200">
                {residentPhoto ? (
                  <Image
                    source={{ uri: residentPhoto }}
                    className="h-32 w-32 rounded-full"
                  />
                ) : (
                  <Feather name="image" size={48} color="#6b7280" />
                )}
              </View>
              <Text className="mt-3 font-mulish text-sm text-indigo-600">
                {residentPhoto
                  ? "Toque para alterar a imagem"
                  : "Adicionar imagem"}
              </Text>
            </TouchableOpacity>
          </View>
          <InputField
            label="Nome"
            placeholder="Digite o nome do morador"
            value={residentName}
            onChangeText={setResidentName}
          />
          <InputField
            label="Telefone"
            placeholder="(00) 00000-0000"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <InputField
            label="Chave PIX"
            placeholder="Digite a chave PIX"
            value={pixKey}
            onChangeText={setPixKey}
          />
        </View>
      </ScrollView>

      {/* Botão fixo no rodapé */}
      <View className="pb-[30px]">
        <TouchableOpacity
          className="w-full rounded-lg bg-indigo-600 px-4 py-3"
          onPress={handlePress}
        >
          <Text className="text-center text-lg font-semibold text-white">
            Registrar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
