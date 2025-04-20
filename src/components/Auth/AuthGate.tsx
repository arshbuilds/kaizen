"use client";
import { useUserData } from "@/src/hooks/useUserDatat";

export const AuthGate = ({ children }: { children: React.ReactNode }) => {
 const { loading } = useUserData();

  if (loading) return <div>Loading...</div>;

  return <>{children}</>;
};
