import { useAuthStore } from "../stores/useAuthStore";

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  return { user, loading };
};
