"use client";
import { ReactNode } from "react";
import { useUserData } from "../hooks/useUserData";
import { useAuthStore } from "../stores/useAuthStore";
import Loading from "../components/Loading/Loading";

export default function AuthProvider({ children }: { children: ReactNode }) {
  useUserData();
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return (
   <Loading/>
    );
  }

  return <>{children}</>;
}
