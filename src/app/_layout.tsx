import LoadingScreen from "@/src/components/ui/loading-screen";
import { Toaster } from "@/src/components/ui/sonner";
import { AuthProvider, useAuth } from "@/src/features/auth/contexts";
import { GlobalErrorBoundary } from "@/src/components/error-boundary/GlobalErrorBoundary";
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
import "../../global.css";
import { ApolloProvider } from "@apollo/client/react";
import { apolloClient } from "@/src/services/apolloClient";

import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: "https://da32d972451786e6c1a0aea2f4024516@o4510817801928704.ingest.us.sentry.io/4510818996322304",

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration(),
  ],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

SplashScreen.preventAutoHideAsync();

GoogleSignin.configure({
  iosClientId:
    "475215012202-oq93e4s85f7uuhfji6k2nkhdb7i2dfm3.apps.googleusercontent.com",
  webClientId:
    "475215012202-3au572tua9mtmv5647hbdsu342402sko.apps.googleusercontent.com",
});

function RootStack() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

function RootLayout() {
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

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GlobalErrorBoundary>
        <ApolloProvider client={apolloClient}>
          <AuthProvider>
            <RootStack />
            <Toaster position="bottom-center" />
          </AuthProvider>
        </ApolloProvider>
      </GlobalErrorBoundary>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(RootLayout);
