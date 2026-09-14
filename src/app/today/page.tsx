"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useUser, UserButton, SignInButton, Show } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarCheck,
  Target,
  Sparkles,
  Clock,
  ArrowRight,
  Flame,
  SlidersHorizontal,
} from "lucide-react";
import { ApiResponse } from "@/src/types/api";
import { UserPreferencesDto } from "@/src/lib/validations/userSchemas";
import { SubtleQuote } from "@/src/components/ui/SubtleQuote";

export default function TodayPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync Clerk user with MongoDB on first load
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setIsSyncing(true);
      fetch("/api/auth/sync-user", { method: "POST" })
        .then((res) => res.json())
        .catch((err) => console.error("Sync error:", err))
        .finally(() => setIsSyncing(false));
    }
  }, [isLoaded, isSignedIn]);

  // Fetch user planning preferences (daily target minutes, timezone, etc.)
  const { data: prefResponse } = useQuery<ApiResponse<UserPreferencesDto>>({
    queryKey: ["preferences"],
    queryFn: async () => {
      const res = await fetch("/api/preferences");
      if (!res.ok) throw new Error("Failed to load preferences");
      return res.json();
    },
    enabled: isLoaded && isSignedIn,
  });

  const dailyMinutes =
    prefResponse && prefResponse.success
      ? prefResponse.data.dailyTargetMinutes
      : 180;
  const hours = Math.floor(dailyMinutes / 60);
  const minutes = dailyMinutes % 60;

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 pb-28 pt-6 max-w-lg mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <CalendarCheck className="text-blue-500" size={24} />
            <span>Today&apos;s Focus</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{currentDate}</p>
        </div>
        <div className="flex items-center gap-3">
          {isSyncing && (
            <span className="text-[11px] text-blue-400 animate-pulse">
              Syncing...
            </span>
          )}
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors">
                Sign In
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 ring-2 ring-blue-500/30",
                },
              }}
            />
          </Show>
        </div>
      </div>

      {/* Available Time & Daily Target Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900/50 border border-blue-800/40 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
            <Clock size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Daily Target</div>
            <div className="text-sm font-semibold text-white">
              {hours > 0 ? `${hours}h ` : ""}
              {minutes > 0 ? `${minutes}m` : ""} Available
            </div>
          </div>
        </div>

        <Link
          href="/profile/settings"
          className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 py-1.5 px-2.5 rounded-lg bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-colors"
          title="Adjust planning constraints"
        >
          <SlidersHorizontal size={13} />
          <span>Adjust</span>
        </Link>
      </div>

      {/* Subtle Quote */}
      <SubtleQuote
        quote="Continuous improvement is better than delayed perfection."
        attribution="Mark Twain"
      />

      {/* Welcome / Empty Plan State */}
      <div className="bg-[#1e2235]/80 border border-slate-700/60 rounded-2xl p-6 text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/20">
          <Sparkles size={24} />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-white">
            Welcome to Kaizen, {user?.firstName || "Friend"}
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Tell Kaizen who you want to become, and Kaizen helps determine what
            you should do today to get there.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          <Link
            href="/goals/new"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-medium text-white shadow-lg shadow-blue-500/25 transition-all text-sm"
          >
            <Target size={18} />
            <span>Create Your First Goal</span>
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/focus"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 font-medium transition-all text-xs"
          >
            <Flame size={16} className="text-orange-400" />
            <span>Open Focus Mode</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
