import LoadingScreen from "@/components/ui/loading-screen";
import { useAuth } from "@/contexts";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import IconGoogle from "../assets/images/google-icon.svg";

const { height } = Dimensions.get("window");

export default function LoginScreen() {
  const { signIn, isLoading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  async function handleGoogleSignIn() {
    if (isSigningIn) return; // Previne múltiplos cliques

    setIsSigningIn(true);
    try {
      await signIn();
      // Navegação será feita automaticamente pelo AppNavigator no _layout.tsx
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
      Alert.alert(
        "Erro no Login",
        "Não foi possível fazer login com Google. Tente novamente."
      );
      setIsSigningIn(false);
    }
  }

  // Mostra loading enquanto verifica autenticação inicial
  if (isLoading) {
    return <LoadingScreen message="Verificando autenticação..." />;
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
        className="mt-8 w-full flex-1 items-center justify-between overflow-hidden rounded-t-[24px] bg-white px-6 py-8 shadow-lg"
        style={{
          marginTop: -25,
          paddingTop: 40,
          minHeight: height * 0.5,
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
          className={`mt-6 h-[50px] w-[345px] flex-row items-center justify-center gap-3 rounded-lg ${
            isSigningIn ? "bg-gray-300" : "bg-[#ececec]"
          }`}
          onPress={handleGoogleSignIn}
          disabled={isSigningIn}
        >
          {isSigningIn ? (
            <ActivityIndicator size="small" color="#4F46E5" />
          ) : (
            <>
              <IconGoogle style={{ width: 24, height: 24 }} />
              <Text className="text-center font-inter-light text-[14px] text-black">
                Entrar com Google
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
