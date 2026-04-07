import { Redirect, Stack } from "expo-router";

import { useProtectedSession } from "@/src/features/auth/hooks/useAuth";
import LoadingScreen from "@/src/shared/components/ui/loading-screen";
import SessionErrorScreen from "@/src/shared/components/ui/session-error-screen";

export function ProtectedStackLayout() {
  const { authenticatedUser, cachedUser, isLoading, isError, refetch } =
    useProtectedSession();

  if (isLoading) {
    return (
      <LoadingScreen
        message={
          cachedUser?.nome
            ? `Validando sessão de ${cachedUser.nome}...`
            : "Validando sessão..."
        }
      />
    );
  }

  if (isError) {
    return (
      <SessionErrorScreen
        title="Sessão indisponível"
        message={
          cachedUser?.nome
            ? `Não foi possível validar a sessão de ${cachedUser.nome}. Verifique sua conexão e tente novamente.`
            : "Não foi possível validar sua sessão. Verifique sua conexão e tente novamente."
        }
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  if (!authenticatedUser) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
