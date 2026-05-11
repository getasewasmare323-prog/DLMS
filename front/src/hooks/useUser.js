import { useQuery } from "@tanstack/react-query";
import { fetchMe } from "../data/userEndPoint";

export function useUser() {
  const {
    data: user,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["user"],
    queryFn: fetchMe,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  return { user, error, isLoading };
}
