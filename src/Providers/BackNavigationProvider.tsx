"use client";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function BackNavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack && pathname !== "/") {
        router.push("/");
      } else {
        App.exitApp();
      }
    });

    return () => {
      App.removeAllListeners();
    };
  }, [router, pathname]);

  return <>{children}</>;
}
