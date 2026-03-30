import { useAuthUserQuery } from "./useAuthQueries";

export function useAuth() {
  const { data: user = null, isLoading } = useAuthUserQuery();

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
  };
}
