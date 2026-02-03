import LoadingScreen from "@/src/components/ui/loading-screen";
import { useAuth } from "@/src/features/auth/contexts";
import { Redirect } from "expo-router";

export default function Index() {
  const { user, loading, republicData } = useAuth();
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

  // Já participa de uma república
  if (republicData && Array.isArray(republicData) && republicData.length > 0) {
    const rep = republicData[0];
    return <Redirect href={`/(republics)/${rep.id}`} />;
  }

  return <Redirect href="/(userProfile)/profile" />;
}
