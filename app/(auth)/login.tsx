import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "@/contexts/AuthContext";

import IconGoogle from "@/assets/images/google-icon.svg";

const { height } = Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { loginWithGoogle, error } = useAuth();

  const handleGoogleLogin = async () => {
    if (isSigningIn) return; // Previne múltiplos cliques

    setIsSigningIn(true); // Desabilita o botão e mostra o loading
    try {
      await GoogleSignin.hasPlayServices();

      const userInfo = await GoogleSignin.signIn();

      const googleToken = userInfo.data?.idToken;

      if (!googleToken) {
        throw new Error("Não foi possível obter o token do Google");
      }

      // Enviar para seu backend
      const result = await loginWithGoogle(googleToken);

      if (!result) {
        return;
      }

      router.replace("/");
    } catch (err) {
      console.error("Erro no login:", err);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <View className="flex-1 items-center bg-white">
      <Image
        source={require("../../assets/images/image-login.webp")}
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
          onPress={handleGoogleLogin}
          disabled={isSigningIn} // Desabilita o botão durante o login
        >
          {isSigningIn ? ( // Se isSigningIn for true, mostra o ActivityIndicator
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
        {error && <Text style={{ color: "red" }}>{error}</Text>}
      </View>
    </View>
  );
}
