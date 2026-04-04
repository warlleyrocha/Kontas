import { useCurrentUserQuery } from "@/src/features/user/hooks/useUserQueries";

export function useAuth() {
  const { data: user = null, ...rest } = useCurrentUserQuery();

  return {
    user,
    isAuthenticated: Boolean(user),
    ...rest,
  };
}
