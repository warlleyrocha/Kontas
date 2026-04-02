// src/providers/AppProviders.tsx
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { GlobalErrorBoundary } from "@/src/shared/components/error-boundary/GlobalErrorBoundary";
import { QueryClientProvider } from "@tanstack/react-query";
import { RefreshProvider } from "@/src/shared/contexts/RefreshContext";
import { queryClient } from "@/src/services/queryClient";

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
