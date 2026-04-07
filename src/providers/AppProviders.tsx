// src/providers/AppProviders.tsx

import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { queryClient } from "@/src/services/queryClient";
import { GlobalErrorBoundary } from "@/src/shared/components/error-boundary/GlobalErrorBoundary";
import { RefreshProvider } from "@/src/shared/contexts/RefreshContext";

export function AppProviders({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GlobalErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <RefreshProvider>{children}</RefreshProvider>
        </QueryClientProvider>
      </GlobalErrorBoundary>
    </GestureHandlerRootView>
  );
}
