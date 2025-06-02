import { useAppSelector } from "@/app/hooks";
import { useGetCurrentUserQuery } from "./api/authApi";

export function useAuth() {
  const token = useAppSelector((s) => s.auth.token);

  // Always run the query on app start - let the backend handle refresh token logic
  const { isLoading, isFetching } = useGetCurrentUserQuery(undefined, {
    refetchOnMountOrArgChange: false,
    refetchOnReconnect: false,
    refetchOnFocus: false,
  });

  // Show loading during initial authentication check
  const authLoading = isLoading || isFetching;

  return {
    token,
    authLoading,
  };
}
