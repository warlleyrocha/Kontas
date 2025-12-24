import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { authService } from "../services/auth.service";
import { AuthResponse } from "../types/auth.types";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginWithGoogle = async (
    googleToken: string
  ): Promise<AuthResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const data = await authService.googleLogin(googleToken);

      await AsyncStorage.setItem("@app:token", data.token);
      await AsyncStorage.setItem("@app:user", JSON.stringify(data.user));

      return data;
    } catch (err) {
      console.error("🔐 Hook: Erro capturado:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loginWithGoogle,
    loading,
    error,
  };
};
