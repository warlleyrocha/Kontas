import "../../global.css";
import { wrap } from "@sentry/react-native";
import { Stack } from "expo-router";
import { preventAutoHideAsync } from "expo-splash-screen";

import { useSessionLifecycle } from "@/src/features/auth/hooks/useAuth";
import useAppReady from "@/src/hooks/useAppReady";
import { configureGoogleSignin } from "@/src/lib/google-signin";
import { initSentry } from "@/src/lib/sentry";
import { Toaster } from "@/src/shared/components/ui/sonner";
import { AppProviders } from "../providers/AppProviders";

initSentry();
configureGoogleSignin();
preventAutoHideAsync();

function RootStack() {
  useSessionLifecycle();

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
