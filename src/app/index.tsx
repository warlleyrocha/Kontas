import { Redirect } from "expo-router";

import { useAuthSession } from "@/src/features/auth/hooks/useAuth";
import { useRepublicsQuery } from "@/src/features/republic/hooks/useRepublicQueries";
import LoadingScreen from "@/src/shared/components/ui/loading-screen";
import SessionErrorScreen from "@/src/shared/components/ui/session-error-screen";

export default function Index() {
  const {
    authenticatedUser,
    cachedUser,
    isLoading,
    isError,
    refetch: refetchSession,
  } = useAuthSession();
  const {
    data: republics = [],
    isLoading: isRepublicsLoading,
    isError: isRepublicsError,
    refetch: refetchRepublics,
  } = useRepublicsQuery({ enabled: !!authenticatedUser?.perfilCompleto });

  if (isLoading || (authenticatedUser?.perfilCompleto && isRepublicsLoading)) {
    return (
      <LoadingScreen
        message={
          cachedUser?.nome
            ? `Carregando dados de ${cachedUser.nome}...`
            : "Carregando seus dados..."
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
          void refetchSession();
        }}
      />
    );
  }

  if (isRepublicsError) {
    return (
      <SessionErrorScreen
        title="Não foi possível carregar seus dados"
        message="Verifique sua conexão e tente carregar novamente."
        onRetry={() => {
          void refetchRepublics();
        }}
      />
    );
  }

  if (!authenticatedUser) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!authenticatedUser.perfilCompleto) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  if (republics.length > 0) {
    return <Redirect href={`/(republics)/${republics[0].id}`} />;
  }

  return <Redirect href="/(userProfile)/profile" />;
}
