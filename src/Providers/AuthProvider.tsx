"use client";
import { ReactNode } from "react";
import { useUserData } from "../hooks/useUserData";
import { useAuthStore } from "../stores/useAuthStore";

export default function AuthProvider({ children }: { children: ReactNode }) {
  useUserData();
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl font-semibold">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
