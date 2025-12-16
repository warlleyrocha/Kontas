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
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Resident {
  id: string;
  name: string;
  pixKey: string;
  photo?: string; // Foto do usuário
}

export default function Residents() {
  const { user } = useAuth();
  const router = useRouter();
  const [residentName, setResidentName] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [residentPhoto, setResidentPhoto] = useState<string | undefined>(
    undefined
  );
  const [residents, setResidents] = useState<Resident[]>(() => {
    // Inicializa o array com o usuário logado
    if (user?.user) {
      return [
        {
          id: user.user.id,
          name: user.user.name || "",
          pixKey: user.user.email, // Usa o email como chave PIX padrão
          photo: user.user.photo || undefined, // Adiciona a foto do usuário do Google
        },
      ];
    }
    return [];
  });
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

  const handleAddResident = () => {
    if (residentName.trim()) {
      setResidents([
        ...residents,
        {
          id: Date.now().toString(),
          name: residentName,
          pixKey: pixKey,
          photo: residentPhoto,
        },
      ]);
      setResidentName("");
      setPixKey("");
      setResidentPhoto(undefined);
    }
  };

  const handleRemoveResident = (id: string) => {
    setResidents(residents.filter((resident) => resident.id !== id));
  };

  const handlePress = async () => {
    if (residents.length === 0) {
      Alert.alert("Atenção", "Adicione pelo menos um morador para continuar");
      return;
    }

    try {
      const republica: Republica = {
        nome: republicName,
        imagemRepublica: republicImage,
        moradores: residents.map((r) => ({
          id: r.id,
          nome: r.name,
          chavePix: r.pixKey || undefined,
          fotoPerfil: r.photo || undefined, // Adiciona a foto do perfil
        })),
        contas: [],
      };

      // Salva os dados consolidados
      await AsyncStorage.setItem("@republica_data", JSON.stringify(republica));

      // Remove os dados temporários
      await AsyncStorage.removeItem("@temp_republica_nome");
      await AsyncStorage.removeItem("@temp_republica_imagem");

      router.replace("/dashboard");
    } catch (error) {
      console.error("Error saving republic data:", error);
      Alert.alert("Erro", "Não foi possível salvar. Tente novamente.");
    }
  };

  return (
    <View className="flex-1 bg-white px-4 pt-6">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Cabeçalho */}
        <Header title="Registrar Moradores" />

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
            label="Chave PIX"
            placeholder="Digite a chave PIX"
            value={pixKey}
            onChangeText={setPixKey}
          />

          <TouchableOpacity
            className="mt-2 items-center justify-center rounded-lg bg-indigo-600 px-4 py-3"
            onPress={handleAddResident}
          >
            <Text className="font-inter-medium text-lg text-white">
              + Adicionar Morador
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lista */}
        {residents.length > 0 && (
          <View className="mb-6">
            <Text className="mb-3 text-lg font-semibold text-gray-900">
              Moradores ({residents.length})
            </Text>

            <FlatList
              data={residents}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View className="mb-3 flex-row items-center rounded-lg bg-gray-50 px-4 py-3">
                  {/* Foto do perfil */}
                  <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                    {item.photo ? (
                      <Image
                        source={{ uri: item.photo }}
                        className="h-12 w-12 rounded-full"
                      />
                    ) : (
                      <Feather name="user" size={20} color="#4f46e5" />
                    )}
                  </View>

                  {/* Informações do morador */}
                  <View className="flex-1">
                    <View className="mb-2 flex-row items-center justify-between">
                      <Text className="flex-1 font-semibold text-gray-900">
                        {item.name}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveResident(item.id)}
                      >
                        <Text className="text-lg text-red-500">×</Text>
                      </TouchableOpacity>
                    </View>
                    <Text className="text-sm text-gray-600">
                      PIX: {item.pixKey}
                    </Text>
                  </View>
                </View>
              )}
            />
          </View>
        )}
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
