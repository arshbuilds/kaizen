"use client";
import React from "react";
import { SignOutButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <SignOutButton redirectUrl="/enter">
      <button className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 font-medium transition-colors text-sm">
        <LogOut size={16} />
        <span>Sign Out</span>
      </button>
    </SignOutButton>
  );
}
