import LoadingScreen from "@/components/ui/loading-screen";
import { Toaster } from "@/components/ui/sonner";

import { AuthProvider, useAuth } from "@/contexts";

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
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";

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
  const { loading } = useAuth();

  // Mostra uma tela de carregamento enquanto verifica a autenticação
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerTitle: "Index" }} />
      <Stack.Screen name="(auth)/login" options={{ headerTitle: "Login" }} />
      <Stack.Screen
        name="(auth)/onboarding"
        options={{ headerTitle: "Onboarding" }}
      />
      <Stack.Screen
        name="(userProfile)/profile"
        options={{ headerTitle: "User Profile" }}
      />
      <Stack.Screen
        name="(userProfile)/invites"
        options={{ headerTitle: "Invites" }}
      />
      <Stack.Screen
        name="(userProfile)/register/republic"
        options={{ headerTitle: "Register Republic" }}
      />
      <Stack.Screen
        name="(userProfile)/register/residents"
        options={{ headerTitle: "Register Residents" }}
      />
      <Stack.Screen
        name="(userProfile)/home"
        options={{ headerTitle: "Home" }}
      />
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
      SplashScreen.hideAsync(); // Oculta a splash screen quando as fontes estiverem carregadas
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AppNavigator />
        <Toaster position="top-center" />
      </AuthProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
