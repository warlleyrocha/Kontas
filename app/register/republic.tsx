import InputField from "@/components/ui/input-field";
import {
  REPUBLIC_STORAGE_KEY,
  USER_PROFILE_STORAGE_KEY,
} from "@/constants/storageKeys";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import uuid from "react-native-uuid";

export default function Register() {
  const { width, height } = Dimensions.get("window");
  const router = useRouter();
  const [republicName, setRepublicName] = useState("");
  const [republicImage, setRepublicImage] = useState<string | undefined>(
    undefined
  );

  const selecionarImagemRepublica = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de permissão para acessar suas fotos!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setRepublicImage(result.assets[0].uri);
    }
  };

  const handlePress = async () => {
    if (!republicName.trim()) {
      Alert.alert("Erro", "Por favor, informe o nome da república");
      return;
    }

    try {
      // Busca dados do perfil do usuário
      const profileStr = await AsyncStorage.getItem(USER_PROFILE_STORAGE_KEY);
      console.log("Dados do perfil recuperados:", profileStr);

      if (!profileStr) {
        Alert.alert("Erro", "Não foi possível obter os dados do usuário.");
        console.log(
          "Perfil do usuário não encontrado no AsyncStorage.",
          profileStr
        );
        return;
      }
      const profile = JSON.parse(profileStr);

      // Cria o morador admin
      const moradorAdmin = {
        id: uuid.v4(),
        nome: profile.name,
        chavePix: profile.pixKey,
        fotoPerfil: profile.photo,
        telefone: profile.phone,
      };

      // Cria a república
      const republica = {
        id: uuid.v4(),
        nome: republicName.trim(),
        imagemRepublica: republicImage,
        moradores: [moradorAdmin],
        contas: [],
      };

      // Salva a república no AsyncStorage
      await AsyncStorage.setItem(
        REPUBLIC_STORAGE_KEY,
        JSON.stringify(republica)
      );
      console.log("República salva com sucesso:", republica);
      // Redireciona para a home
      router.replace("/home");
    } catch (error) {
      console.error("Erro ao salvar república:", error);
      Alert.alert("Erro", "Não foi possível salvar. Tente novamente.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <ImageBackground
          source={require("@/assets/images/image-register.jpg")}
          style={{
            width: "100%",
            minHeight: height * 0.4,
          }}
          className="items-center justify-center"
          resizeMode="cover"
        >
          <View className="items-center justify-center gap-[24px] py-12">
            <View className="h-[81px] w-[81px] items-center justify-center rounded-full bg-[#111928]">
              <Text className="font-inter-semibold text-[36px] text-white">
                iF
              </Text>
            </View>

            <Text
              className="text-center font-inter-semibold leading-[22px] text-white"
              style={{
                fontSize: width > 400 ? 25 : 24,
                lineHeight: width > 400 ? 28 : 24,
                paddingHorizontal: width * 0.1,
              }}
            >
              Cadastre sua {"\n"} República
            </Text>
          </View>
        </ImageBackground>

        <View
          className="flex-1 items-center rounded-t-[24px] bg-[#FAFAFA] px-4 pb-8"
          style={{
            width: width,
            marginTop: -25,
            paddingTop: 48,
          }}
        >
          {/* Seleção de Imagem */}
          <View className="mb-6 w-full items-center">
            <TouchableOpacity
              onPress={selecionarImagemRepublica}
              className="items-center"
            >
              <View className="h-32 w-32 items-center justify-center rounded-full bg-gray-200">
                {republicImage ? (
                  <Image
                    source={{ uri: republicImage }}
                    className="h-32 w-32 rounded-full"
                  />
                ) : (
                  <Feather name="image" size={48} color="#6b7280" />
                )}
              </View>
              <Text className="mt-3 font-mulish text-sm text-indigo-600">
                {republicImage
                  ? "Toque para alterar a imagem"
                  : "Adicionar imagem"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Campo de Nome da República */}
          <View className="mb-6 w-full">
            <InputField
              label="Nome"
              placeholder="Digite o nome da sua república"
              value={republicName}
              onChangeText={setRepublicName}
            />
          </View>

          {/* Spacer - empurra o botão para baixo */}
          <View className="min-h-[20px] flex-1" />

          <TouchableOpacity
            className="w-full rounded-lg bg-indigo-600 px-4 py-3"
            onPress={handlePress}
          >
            <Text className="text-center font-inter-medium text-lg text-white">
              Cadastrar
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
