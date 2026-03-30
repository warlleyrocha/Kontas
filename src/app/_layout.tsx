import "../../global.css";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { wrap } from "@sentry/react-native";
import { Stack } from "expo-router";
import { preventAutoHideAsync } from "expo-splash-screen";

import { useCurrentUserQuery } from "@/src/features/user/hooks/useUserQueries";
import { initSentry } from "@/src/lib/sentry";
import { configureGoogleSignin } from "@/src/lib/google-signin";
import useAppReady from "@/src/hooks/useAppReady";
import { AppProviders } from "../providers/AppProviders";

import LoadingScreen from "@/src/shared/components/ui/loading-screen";
import { Toaster } from "@/src/shared/components/ui/sonner";

initSentry();
configureGoogleSignin();
preventAutoHideAsync();

function RootStack() {
  const { data: user = null, isLoading } = useCurrentUserQuery();
  const queryClient = useQueryClient();
  const wasAuthenticatedRef = useRef(false);

  useEffect(() => {
    const isAuthenticated = Boolean(user);
    if (wasAuthenticatedRef.current && !isAuthenticated) {
      queryClient.clear();
    }
    wasAuthenticatedRef.current = isAuthenticated;
  }, [user, queryClient]);

  if (isLoading) {
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
