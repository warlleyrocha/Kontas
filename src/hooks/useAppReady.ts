import { hideAsync } from "expo-splash-screen";
import { useEffect, useState } from "react";
import { hydrateAuthorizationHeader } from "@/src/services/authHeader";
import useAppFonts from "./useAppFonts";

export default function useAppReady() {
  const fontsLoaded = useAppFonts();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!fontsLoaded) return;

    const hydrate = async () => {
      // Hidrata o token primeiro para garantir que o header esteja pronto
      // antes da primeira validação de sessão com o servidor.
      try {
        await hydrateAuthorizationHeader();
      } catch {
        // Token não disponível — usuário não autenticado.
        // A sessão autenticada deve ser derivada apenas da validação do token
        // no servidor via useCurrentUserQuery.
      } finally {
        setHydrated(true);
      }
    };

    void hydrate();
  }, [fontsLoaded]);

  const ready = fontsLoaded && hydrated;

  useEffect(() => {
    if (ready) void hideAsync();
  }, [ready]);

  return ready;
}
