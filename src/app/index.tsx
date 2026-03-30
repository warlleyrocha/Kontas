import { Redirect } from "expo-router";

import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { useRepublicsQuery } from "@/src/features/republic/hooks/useRepublicQueries";
import LoadingScreen from "@/src/shared/components/ui/loading-screen";

export default function Index() {
  const { user, isLoading } = useAuth();
  const { data: republics = [], isLoading: isRepublicsLoading } =
    useRepublicsQuery({ enabled: !!user?.perfilCompleto });

  if (isLoading || (user?.perfilCompleto && isRepublicsLoading)) {
    return <LoadingScreen message="Carregando..." />;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!user.perfilCompleto) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  if (republics.length > 0) {
    return <Redirect href={`/(republics)/${republics[0].id}`} />;
  }

  return <Redirect href="/(userProfile)/profile" />;
}
