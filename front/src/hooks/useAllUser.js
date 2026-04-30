import { useQuery } from "@tanstack/react-query";
import { getAllUser } from "../data/userEndPoint";

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
  console.log("useUser hook - user data:", user);
  return { user, error, isLoading };
}
