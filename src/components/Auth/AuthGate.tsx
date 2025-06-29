"use client";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/enter?redirectTo=${encodeURIComponent(pathname)}`); // or wherever your login page is
    }
  }, [user, loading, router, pathname]);

  if (loading) return <div>fuck you</div>;

  return <>{children}</>;
};
