import { REPUBLIC_STORAGE_KEY } from "@/constants/storageKeys";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

import type { Republica } from "@/types/resume";

export function useAsyncStorage<T>(key: string, initialValue: T) {
  const [data, setData] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados do AsyncStorage ao montar
  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          setData(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [key]);

  // Salvar dados no AsyncStorage sempre que mudarem
  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem(key, JSON.stringify(data));
      } catch (error) {
        console.error("Erro ao salvar dados:", error);
      }
    };

    // Não salvar durante o carregamento inicial
    if (!isLoading) {
      saveData();
    }
  }, [data, isLoading, key]);

  return { data, setData, isLoading };
}

// Função utilitária para verificar se os dados da república estão completos
export async function checkRepublicaData(): Promise<{
  isComplete: boolean;
  data: Republica | null;
}> {
  try {
    const stored = await AsyncStorage.getItem(REPUBLIC_STORAGE_KEY);
    if (!stored) {
      return { isComplete: false, data: null };
    }

    const data: Republica = JSON.parse(stored);

    // Verifica se todos os dados essenciais estão presentes
    const isComplete = !!(
      data.nome &&
      data.nome.trim() !== "" &&
      data.moradores &&
      data.moradores.length > 0
    );

    return { isComplete, data: isComplete ? data : null };
  } catch (error) {
    console.error("Erro ao verificar dados da república:", error);
    return { isComplete: false, data: null };
  }
}
