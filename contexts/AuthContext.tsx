import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  GoogleSignin,
  User,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

/**
 * Interface que define o tipo de dados do usuário autenticado
 */
interface AuthContextData {
  user: User | null; // Dados do usuário logado (null se não estiver logado)
  isLoading: boolean; // Indica se está verificando a autenticação
  signIn: () => Promise<void>; // Função para fazer login com Google
  signOut: () => Promise<void>; // Função para fazer logout
}

/**
 * Cria o contexto de autenticação
 * Este contexto será usado para compartilhar os dados de autenticação
 * em toda a aplicação
 */
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

/**
 * Chave usada para salvar os dados do usuário no AsyncStorage
 */
const USER_STORAGE_KEY = "@kontas:user";

/**
 * Hook personalizado para acessar o contexto de autenticação
 * Use este hook em qualquer componente para acessar os dados de autenticação
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  return context;
}

/**
 * Props do AuthProvider
 */
interface AuthProviderProps {
  readonly children: ReactNode;
}

/**
 * Provider de autenticação
 * Envolve a aplicação e fornece os dados de autenticação para todos os componentes
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Efeito que roda ao montar o componente
   * Verifica se existe um usuário salvo no AsyncStorage
   * e se ele ainda está logado no Google
   */
  useEffect(() => {
    async function loadStoredUser() {
      try {
        // 1. Tenta carregar os dados do usuário do AsyncStorage
        const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);

        if (storedUser) {
          // 2. Verifica se o usuário ainda está logado no Google
          const currentUser = await GoogleSignin.getCurrentUser();

          if (currentUser) {
            // Se ainda está logado, usa os dados atualizados
            setUser(currentUser);
            // Atualiza o AsyncStorage com os dados mais recentes
            await AsyncStorage.setItem(
              USER_STORAGE_KEY,
              JSON.stringify(currentUser)
            );
          } else {
            // Se não está mais logado, limpa os dados salvos
            await AsyncStorage.removeItem(USER_STORAGE_KEY);
            setUser(null);
          }
        } else {
          // 3. Se não tem dados salvos, verifica se há usuário logado no Google
          const currentUser = await GoogleSignin.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            await AsyncStorage.setItem(
              USER_STORAGE_KEY,
              JSON.stringify(currentUser)
            );
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadStoredUser();
  }, []);

  /**
   * Função para fazer login com Google
   * 1. Verifica se os serviços do Google estão disponíveis (Android)
   * 2. Inicia o fluxo de login do Google
   * 3. Salva os dados do usuário no estado e no AsyncStorage
   */
  async function signIn() {
    try {
      // Importante para Android - verifica se os Google Play Services estão disponíveis
      await GoogleSignin.hasPlayServices();

      // Inicia o fluxo de login
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const userData = response.data;

        // Salva no estado
        setUser(userData);

        // Salva no AsyncStorage para persistência
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
      throw error; // Propaga o erro para o componente que chamou
    }
  }

  /**
   * Função para fazer logout
   * 1. Faz logout no Google
   * 2. Limpa os dados do AsyncStorage
   * 3. Limpa o estado do usuário
   */
  async function signOut() {
    try {
      // Faz logout no Google
      await GoogleSignin.signOut();

      // Limpa os dados salvos
      await AsyncStorage.removeItem(USER_STORAGE_KEY);

      // Limpa o estado
      setUser(null);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      throw error;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
