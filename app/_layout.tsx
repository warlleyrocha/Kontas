import LoadingScreen from "@/components/ui/loading-screen";
import { AuthProvider, useAuth } from "@/contexts";
import { checkRepublicaData } from "@/hooks/useAsyncStorage";
import {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_900Black,
} from "@expo-google-fonts/inter";
import {
  Mulish_300Light,
  Mulish_400Regular,
  Mulish_500Medium,
  Mulish_600SemiBold,
  Mulish_700Bold,
  Mulish_900Black,
} from "@expo-google-fonts/mulish";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";

// Previne a splash screen de ocultar automaticamente
SplashScreen.preventAutoHideAsync();

// Configura o Google Sign In
GoogleSignin.configure({
  iosClientId:
    "475215012202-oq93e4s85f7uuhfji6k2nkhdb7i2dfm3.apps.googleusercontent.com",
  webClientId:
    "475215012202-3au572tua9mtmv5647hbdsu342402sko.apps.googleusercontent.com",
});

/**
 * Componente interno que gerencia a navegação baseada no estado de autenticação
 * Deve estar dentro do AuthProvider para poder usar o useAuth()
 */
function AppNavigator() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      // Se ainda está carregando, não faz nada
      if (isLoading) return;

      // Se há um usuário logado, verifica os dados da república
      if (user) {
        const { isComplete } = await checkRepublicaData();

        if (isComplete) {
          router.replace("/dashboard");
        } else {
          router.replace("/register");
        }
      } else {
        // Se não há usuário logado, vai para a tela de login
        router.replace("/");
      }
    };

    checkAuth();
  }, [user, isLoading]);

  // Mostra uma tela de carregamento enquanto verifica a autenticação
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerTitle: "Home" }} />
      <Stack.Screen name="register" options={{ headerTitle: "Register" }} />
      <Stack.Screen name="residents" options={{ headerTitle: "Residents" }} />
      <Stack.Screen name="dashboard" options={{ headerTitle: "Dashboard" }} />
    </Stack>
  );
}

const RootLayout = () => {
  const [loaded, error] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_900Black,
    Mulish_300Light,
    Mulish_400Regular,
    Mulish_500Medium,
    Mulish_600SemiBold,
    Mulish_700Bold,
    Mulish_900Black,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
};

export default RootLayout;
