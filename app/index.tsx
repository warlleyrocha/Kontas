import { checkRepublicaData } from "@/hooks/useAsyncStorage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";
import "../global.css";

const { height } = Dimensions.get("window");

export default function App() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkExistingData = async () => {
      const { isComplete } = await checkRepublicaData();

      if (isComplete) {
        // Se os dados já estão completos, redireciona para o dashboard
        router.replace("/dashboard");
      } else {
        setIsChecking(false);
      }
    };

    checkExistingData();
  }, []);

  const handlePress = () => {
    router.push("/register");
  };

  // Mostra uma tela em branco enquanto verifica os dados
  if (isChecking) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="font-inter-medium text-lg text-gray-600">
          Carregando...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center bg-white">
      <Image
        source={require("../assets/images/pexels-olia-danilevich-8093032.jpg")}
        style={{
          width: "100%",
          height: height * 0.5,
          resizeMode: "cover",
        }}
      />

      <View
        className="mt-8 w-full  items-center justify-between overflow-hidden rounded-t-[24px] bg-white px-6 py-8 shadow-lg"
        style={{
          marginTop: -25, // Sobreposição sobre o background
          paddingTop: 40, // Espaço para compensar a sobreposição
          minHeight: height * 0.5, // Mínimo 50% da altura
        }}
      >
        <View className="gap-6">
          <Text className="text-center font-inter-bold text-4xl">Kontas</Text>
          <Text className="px-2 text-center font-mulish-medium leading-[22px]">
            Gerencie com facilidade as contas da sua república. Cadastre
            moradores, acompanhe pagamentos, defina responsáveis e organize
            todas as despesas em um só lugar.
          </Text>
        </View>

        <TouchableOpacity
          className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2"
          onPress={handlePress}
        >
          <Text className="text-center font-inter-medium text-lg text-white">
            Entrar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
