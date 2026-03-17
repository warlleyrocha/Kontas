import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { authService } from "@/src/features/auth/services/auth.service";
import {
  AuthResponse,
  CompleteProfileRequest,
  User,
} from "@/src/features/auth/types/auth.types";
import { userService } from "@/src/features/user/services/user.service";
import { UpdateUserRequest } from "@/src/features/user/types/user.types";
import { getErrorMessage, isUnauthorizedError } from "@/src/services/httpError";
import { logger } from "@/src/shared/utils/logger";
import { showToast } from "@/src/shared/utils/showToast";

// Interface do que o Context vai fornecer
interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  republicData: any;
  loading: boolean;
  error: string | null;
  loginWithGoogle: (token: string) => Promise<AuthResponse | null>;
  logout: () => Promise<void>;
  updateUser: (data: UpdateUserRequest) => Promise<void>;
  completeProfile: (data: CompleteProfileRequest) => Promise<void>;
}

// Criar o Context
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Provider para envolver o app
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  // Controla apenas o bootstrap da sessão para não desmontar a árvore
  // durante ações como login e completeProfile.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [republicData, setRepublicData] = useState(null);
  const wasAuthenticatedRef = useRef(false);

  // Função para verificar autenticação
  const checkAuth = React.useCallback(async () => {
    try {
      logger.info("Auth", "Verificando autenticação");

      // Buscar token e user do AsyncStorage
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem("@app:token"),
        AsyncStorage.getItem("@app:user"),
      ]);

      // Se não tem token, não está logado
      if (!storedToken) {
        logger.warn("Auth", "Nenhum token encontrado");
        setLoading(false);
        return;
      }

      // Mostrar dados do cache imediatamente (UX rápido)
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }

      // Validar token com o backend
      try {
        const userData = await userService.fetchUser();
        logger.info("Auth", "Token válido. Usuário autenticado");

        // Atualizar estado e cache se os dados mudaram
        setUser(userData);
        await AsyncStorage.setItem("@app:user", JSON.stringify(userData));
      } catch (error) {
        if (isUnauthorizedError(error)) {
          logger.warn("Auth", "Token inválido ou expirado");

          // Token inválido → limpar tudo
          await queryClient.cancelQueries();
          await AsyncStorage.multiRemove(["@app:token", "@app:user"]);
          setUser(null);
        } else {
          // Em falhas transitórias de rede, preserva sessão local e tenta novamente depois.
          const message = getErrorMessage(error, "Erro ao validar sessão");
          logger.warn("Auth", "Falha transitória ao validar sessão", {
            message,
          });
        }
      }
    } catch (error) {
      logger.error(
        "Auth",
        "Erro na verificação de auth",
        error instanceof Error ? error : undefined
      );
    } finally {
      setLoading(false);
    }
  }, [queryClient]);

  // Ao montar o componente, verificar se há usuário logado
  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  // Login com Google
  const loginWithGoogle = React.useCallback(
    async (googleToken: string): Promise<AuthResponse | null> => {
      setError(null);

      try {
        logger.info("Auth", "Iniciando login com Google");
        const data = await authService.googleLogin(googleToken);

        // Salvar no AsyncStorage em paralelo
        await Promise.all([
          AsyncStorage.setItem("@app:token", data.token),
          AsyncStorage.setItem("@app:user", JSON.stringify(data.user)),
        ]);

        // Atualizar estado
        setUser(data.user);

        logger.info("Auth", "Login bem-sucedido");
        return data;
      } catch (error) {
        const errorMessage = getErrorMessage(error, "Erro desconhecido");
        logger.error("Auth", "Erro no login", new Error(errorMessage));
        setError(errorMessage);
        return null;
      }
    },
    []
  );

  // Logout
  const logout = React.useCallback(async () => {
    try {
      logger.info("Auth", "Iniciando logout");

      await queryClient.cancelQueries();

      // Limpa a sessão do app e a conta mantida pelo Google Sign-In.
      await Promise.allSettled([
        AsyncStorage.multiRemove(["@app:token", "@app:user", "republic-data"]),
        GoogleSignin.signOut(),
      ]);

      // Limpar estado
      setUser(null);
      setRepublicData(null);
      setError(null);

      // Redirecionar para login
      router.replace("/(auth)/login");

      logger.info("Auth", "Logout realizado com sucesso");
    } catch (error) {
      logger.error(
        "Auth",
        "Erro ao fazer logout",
        error instanceof Error ? error : undefined
      );
    }
  }, [queryClient]);

  // Completar perfil
  const completeProfile = React.useCallback(
    async (data: CompleteProfileRequest) => {
      try {
        // 1️⃣ Enviar dados para o backend
        await authService.completeProfile(data);
        logger.info("Auth", "Dados do perfil enviados com sucesso");

        const updatedUser = await userService.fetchUser();

        // 3️⃣ Atualizar Context
        setUser(updatedUser);

        // 4️⃣ Atualizar AsyncStorage
        await AsyncStorage.setItem("@app:user", JSON.stringify(updatedUser));

        logger.info("Auth", "Perfil completado e sincronizado");
      } catch (error) {
        const errorMessage = getErrorMessage(error, "Erro ao completar perfil");
        logger.error(
          "Auth",
          "Erro ao completar perfil",
          new Error(errorMessage)
        );

        setError(errorMessage);

        showToast.error(errorMessage);

        throw error;
      }
    },
    []
  );

  // Atualizar dados do usuário
  const updateUser = React.useCallback(async (data: UpdateUserRequest) => {
    try {
      const userData = await userService.updateUser(data);
      logger.info("Auth", "Usuário atualizado com sucesso");
      setUser(userData);
      await AsyncStorage.setItem("@app:user", JSON.stringify(userData));
    } catch (error) {
      logger.error(
        "Auth",
        "Erro ao atualizar usuário",
        error instanceof Error ? error : undefined
      );
      throw error;
    }
  }, []);

  useEffect(() => {
    AsyncStorage.getItem("republic-data").then((json) => {
      if (json) {
        try {
          const parsed = JSON.parse(json);
          setRepublicData(parsed);
        } catch (error) {
          logger.warn("Auth", "Erro ao parsear republic-data", {
            error: String(error),
          });
        }
      }
    });
  }, []);

  useEffect(() => {
    const isAuthenticated = Boolean(user);

    if (wasAuthenticatedRef.current && !isAuthenticated) {
      queryClient.clear();
    }

    wasAuthenticatedRef.current = isAuthenticated;
  }, [queryClient, user]);

  const contextValue = React.useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      loading,
      error,
      republicData,
      loginWithGoogle,
      logout,
      updateUser,
      completeProfile,
    }),
    [
      user,
      loading,
      republicData,
      error,
      loginWithGoogle,
      logout,
      updateUser,
      completeProfile,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Hook customizado para usar o contexto facilmente
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("❌ useAuth deve ser usado dentro de um AuthProvider");
  }

  return context;
};
