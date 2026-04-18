import Feather from "@expo/vector-icons/Feather";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ImageDefault from "@/assets/images/image-register.webp";
import InputField from "@/src/shared/components/ui/input-field";
import { useComponentLogger } from "@/src/shared/hooks/useComponentLogger";
import { useRepublicActions } from "../hooks/useRepublicActions";
import { useRepublicForm } from "../hooks/useRepublicForm";

export function RegisterRepublicScreen() {
  useComponentLogger("RegisterRepublicScreen");
  const { width, height } = useWindowDimensions();

  const {
    republicName,
    setRepublicName,
    republicImage,
    handleSelectImageRepublic,
  } = useRepublicForm();

  const { createRepublic, isCreating } = useRepublicActions();

  async function handleSubmit() {
    await createRepublic({
      nome: republicName,
      imagemRepublica: republicImage,
    });
  }

  const isButtonDisabled = !republicName.trim() || isCreating;

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
          source={ImageDefault}
          style={{
            width: "100%",
            minHeight: height * 0.35,
          }}
          className="items-center justify-end"
          resizeMode="cover"
        >
          <View className="absolute inset-0 bg-black/40" />
          <View className="w-full items-start px-6 pb-10 pt-6">
            <Text
              className="font-inter-semibold text-white text-shadow"
              style={{ fontSize: 28, lineHeight: 34 }}
            >
              Cadastre sua{"\n"}República
            </Text>
            <Text className="mt-1 font-mulish text-sm text-white text-shadow-sm">
              Personalize e comece a gerenciar
            </Text>
          </View>
        </ImageBackground>

        <SafeAreaView
          className="flex-1 rounded-t-[24px] bg-[#FAFAFA] px-6 pb-8"
          style={{
            width: width,
            marginTop: -20,
            paddingTop: -22,
          }}
        >
          {/* Seleção de Imagem */}
          <View className="mb-8 items-center">
            <TouchableOpacity
              onPress={handleSelectImageRepublic}
              activeOpacity={0.8}
              className="items-center"
            >
              <View className="h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-teal/40 bg-teal/10">
                {republicImage ? (
                  <Image
                    source={{ uri: republicImage }}
                    className="h-28 w-28 rounded-full"
                  />
                ) : (
                  <Feather name="camera" size={32} color="#337176" />
                )}
              </View>
              <Text className="mt-3 font-mulish text-sm text-teal">
                {republicImage ? "Alterar foto" : "Adicionar foto"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Campo de Nome da República */}
          <View className="mb-8 w-full">
            <InputField
              label="Nome da república"
              placeholder="Ex: República dos Amigos"
              value={republicName}
              onChangeText={setRepublicName}
            />
          </View>

          <View className="flex-1" />

          <TouchableOpacity
            className={`w-full rounded-xl px-4 py-4 ${isButtonDisabled ? "bg-gray-300" : "bg-teal"} ${isCreating ? "opacity-60" : ""}`}
            onPress={handleSubmit}
            disabled={isButtonDisabled}
            activeOpacity={0.85}
            accessibilityLabel="Cadastrar República"
          >
            {isCreating ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-center font-inter-semibold text-base text-white">
                Cadastrar República
              </Text>
            )}
          </TouchableOpacity>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
