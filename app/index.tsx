import LoadingScreen from "@/components/ui/loading-screen";
import { useAuth } from "@/contexts";
import { checkRepublicaData } from "@/hooks/useAsyncStorage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

/**
 * Ponto de entrada do app
 * Redireciona o usuário baseado no estado de autenticação:
 * - Não autenticado → Login
 * - Autenticado sem dados → Registro
 * - Autenticado com dados → Dashboard
 */
export default function Index() {
  const { user, isLoading } = useAuth();
  const [isCheckingData, setIsCheckingData] = useState(true);
  const [hasCompleteData, setHasCompleteData] = useState(false);

  useEffect(() => {
    async function checkData() {
      if (user) {
        const { isComplete } = await checkRepublicaData();
        setHasCompleteData(isComplete);
      }
      setIsCheckingData(false);
    }

    if (!isLoading) {
      checkData();
    }
  }, [user, isLoading]);

  // Mostra loading enquanto verifica autenticação e dados
  if (isLoading || isCheckingData) {
    return <LoadingScreen message="Carregando..." />;
  }

  // Usuário não autenticado → vai para login
  if (!user) {
    return <Redirect href="/login" />;
  }

  // Usuário autenticado sem dados completos → vai para registro
  if (!hasCompleteData) {
    return <Redirect href="/register" />;
  }

  // Usuário autenticado com dados completos → vai para dashboard
  return <Redirect href="/home" />;
}
