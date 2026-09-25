import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ClerkProvider } from "@clerk/nextjs";
import QueryProvider from "../Providers/QueryProvider";
import Navbar from "../components/ui/Navbar";
import BackNavigationProvider from "../Providers/BackNavigationProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kaizen — Adaptive Personal Productivity",
  description: "Tell Kaizen who you want to become, and it determines what to do today.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const HIDDEN_NAV_PATHS = ["/enter", "/sign-in", "/sign-up", "/goals/new"];

  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0f172a] text-slate-100 min-h-screen`}
        suppressHydrationWarning={true}
      >
        <ClerkProvider>
          <BackNavigationProvider>
            <QueryProvider>
              {children}
              <Navbar hidden={HIDDEN_NAV_PATHS} />
              <Toaster position="top-center" richColors theme="dark" />
            </QueryProvider>
          </BackNavigationProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
