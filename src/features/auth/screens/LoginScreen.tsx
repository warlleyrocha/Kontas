import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import IconGoogle from "@/assets/images/google-icon.svg";
import ImageLogin from "@/assets/images/image-login.webp";
import { useAuth } from "@/src/features/auth/contexts/AuthContext";
import { getErrorMessage } from "@/src/services/httpError";
import { useComponentLogger } from "@/src/shared/hooks/useComponentLogger";
import { showToast } from "@/src/shared/utils/showToast";
import { SafeAreaView } from "react-native-safe-area-context";

type GoogleSignInResult = Awaited<ReturnType<typeof GoogleSignin.signIn>>;

function getGoogleToken(userInfo: GoogleSignInResult): string | null {
  return userInfo.data?.idToken ?? null;
}

export default function LoginScreen() {
  useComponentLogger("LoginScreen");
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { loginWithGoogle, error } = useAuth();
  const { height } = useWindowDimensions();

  const handleGoogleLogin = async () => {
    if (isSigningIn) return; // Previne múltiplos cliques

    setIsSigningIn(true); // Desabilita o botão e mostra o loading
    let shouldNavigateToHome = false;

    try {
      await GoogleSignin.hasPlayServices();

      const userInfo = await GoogleSignin.signIn();
      const googleToken = getGoogleToken(userInfo);

      if (!googleToken) {
        showToast.error("Não foi possível obter o token do Google");
      } else {
        const result = await loginWithGoogle(googleToken);

        if (result) {
          shouldNavigateToHome = true;
        }
      }
    } catch (error) {
      console.error("Erro no login:", error);
      showToast.error(
        getErrorMessage(
          error,
          "Erro ao fazer login com Google. Tente novamente.",
        ),
      );
    }

    setIsSigningIn(false);

    if (shouldNavigateToHome) {
      router.replace("/");
    }
  };

  return (
    <View className="flex-1 items-center bg-white">
      <Image
        source={ImageLogin}
        style={{
          width: "100%",
          height: height * 0.5,
          resizeMode: "cover",
        }}
      />

      <SafeAreaView
        className="mt-8 w-full flex-1 items-center justify-between overflow-hidden rounded-t-[24px] bg-white px-6 py-8 shadow-lg"
        style={{
          marginTop: -25,
          paddingTop: 0,
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
          className={`mt-20 h-[50px] w-[345px] flex-row items-center justify-center gap-3 rounded-lg ${
            isSigningIn ? "bg-gray-300" : "bg-[#ececec]"
          }`}
          onPress={handleGoogleLogin}
          disabled={isSigningIn} // Desabilita o botão durante o login
        >
          {isSigningIn ? (
            <ActivityIndicator size="small" color="#337176" />
          ) : (
            <>
              <IconGoogle style={{ width: 24, height: 24 }} />
              <Text className="text-center font-inter-light text-[14px] text-black">
                Entrar com Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text className="px-20 text-center text-xs leading-5 text-gray-500">
          Ao continuar, você concorda com nossos{" "}
          <Text
            className="font-semibold text-teal"
            onPress={() => router.push("/terms-of-use")}
          >
            Termos de Uso
          </Text>{" "}
          e{" "}
          <Text
            className="font-semibold text-teal"
            onPress={() => router.push("/privacy-policy")}
          >
            Política de Privacidade
          </Text>
          .
        </Text>

        {error && <Text style={{ color: "red" }}>{error}</Text>}
      </SafeAreaView>
    </View>
  );
}
