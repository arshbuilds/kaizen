"use client";
import React from "react";
import Link from "next/link";
import { ArrowLeft, Sliders } from "lucide-react";
import LogoutButton from "@/src/components/Auth/LogoutButton";
import { UserProfile } from "@clerk/nextjs";
import { PlanningPreferencesForm } from "@/src/components/Settings/PlanningPreferencesForm";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 pb-28 pt-6 max-w-lg mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/today"
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-xs text-slate-400">Account & Planning Constraints</p>
        </div>
      </div>

      {/* Section 1: Planning Constraints */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Sliders size={16} className="text-blue-400" />
          <span>Kaizen Planning Parameters</span>
        </div>
        <PlanningPreferencesForm />
      </div>

      {/* Section 2: Clerk Identity & Security */}
      <div className="pt-6 border-t border-slate-800/80 space-y-3">
        <div className="text-sm font-semibold text-slate-200">
          Account Credentials
        </div>
        <div className="flex justify-center">
          <UserProfile routing="hash" />
        </div>
      </div>

      {/* Logout */}
      <div className="pt-4">
        <LogoutButton />
      </div>
    </div>
  );
}
