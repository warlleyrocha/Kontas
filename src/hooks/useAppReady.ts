import { hideAsync } from "expo-splash-screen";
import { useEffect, useState } from "react";
import { deleteItemAsync, getItemAsync } from "expo-secure-store";
import { userKeys } from "@/src/features/user/hooks/user.keys";
import { queryClient } from "@/src/services/queryClient";
import { APP_USER_STORAGE_KEY } from "@/src/services/storageKeys";
import { hydrateAuthorizationHeader } from "@/src/services/authHeader";
import useAppFonts from "./useAppFonts";

export default function useAppReady() {
  const fontsLoaded = useAppFonts();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!fontsLoaded) return;

    const hydrate = async () => {
      // Hidrata o token primeiro — garante que authorizationHeader esteja
      // pronto antes de qualquer componente montar. Sem isso, se o
      // useCurrentUserQuery tiver cache hit (staleTime: Infinity), o queryFn
      // nunca executa e o token nunca é hidratado via hydrateAuthorizationHeader.
      try {
        await hydrateAuthorizationHeader();
      } catch {
        // Token não disponível — usuário não autenticado.
        // Não deleta o user cache aqui; o queryFn lidará com isso.
      }

      try {
        const cached = await getItemAsync(APP_USER_STORAGE_KEY);
        if (cached) {
          // Popula o cache do React Query antes do mount da query.
          // useCurrentUserQuery tem staleTime: Infinity, então esses dados
          // nunca ficarão stale e não haverá refetch no mount.
          // Se o schema do User mudar entre versões, o catch limpa o cache.
          queryClient.setQueryData(userKeys.current(), JSON.parse(cached));
        }
      } catch {
        // Cache corrompido ou schema incompatível — limpa para forçar
        // refetch da API no próximo mount.
        await deleteItemAsync(APP_USER_STORAGE_KEY);
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
