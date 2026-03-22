import "../../global.css";
import { Stack } from "expo-router";
import { preventAutoHideAsync } from "expo-splash-screen";
import { wrap } from "@sentry/react-native";

import { initSentry } from "@/src/lib/sentry";
import { configureGoogleSignin } from "@/src/lib/google-signin";
import { useAuth } from "@/src/features/auth/contexts";
import useAppReady from "@/src/hooks/useAppReady";
import { AppProviders } from "../providers/AppProviders";

import LoadingScreen from "@/src/shared/components/ui/loading-screen";
import { Toaster } from "@/src/shared/components/ui/sonner";

initSentry();
configureGoogleSignin();
preventAutoHideAsync();

function RootStack() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

function RootLayout() {
  const ready = useAppReady();

  if (!ready) return null;

  return (
    <AppProviders>
      <RootStack />
      <Toaster position="bottom-center" />
    </AppProviders>
  );
}

export default wrap(RootLayout);
