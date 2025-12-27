import LoadingScreen from "@/components/ui/loading-screen";
import { useAuth } from "@/contexts";
import { Redirect } from "expo-router";

export default function Index() {
  const { user, loading } = useAuth();
  // Mostra loading enquanto verifica autenticação e dados
  if (loading) {
    return <LoadingScreen message="Carregando..." />;
  }

  // Usuário não autenticado → vai para login
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!user.perfilCompleto) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  return <Redirect href="/(userProfile)/profile" />;
}
