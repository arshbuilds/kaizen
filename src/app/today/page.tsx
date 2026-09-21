"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, UserButton, SignInButton, Show } from "@clerk/nextjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CalendarCheck,
  Sparkles,
  Loader2,
  SlidersHorizontal,
  Target,
  CheckCircle2,
  Clock,
  Brain,
} from "lucide-react";
import { ApiResponse } from "@/src/types/api";
import {
  TodayResponseDto,
  DailyPlanDto,
  CandidateActionsDto,
  TodayActionDto,
} from "@/src/lib/validations/dailyPlanSchemas";
import { TodayActionCard } from "@/src/components/Today/TodayActionCard";
import { SubtleQuote } from "@/src/components/ui/SubtleQuote";
import { toast } from "sonner";

/**
 * TodayPage (/today)
 *
 * The central hub of the Kaizen daily execution loop.
 * Answers the core question: "What should I work on right now?"
 *
 * States:
 * 1. No plan yet → Shows candidate action preview + "Generate Plan" CTA.
 * 2. Plan exists, actions pending → Shows ordered action queue.
 *    - Each action has a "Launch Focus" button → navigates to /focus?actionId=...
 *    - Each action has a "Skip" button → removes from today's queue.
 * 3. Plan exists, all completed → Shows completion celebration state.
 *
 * Data Flow:
 * - GET /api/today → fetch existing plan or candidate list.
 * - POST /api/today/generate → create or regenerate today's plan.
 * - PATCH /api/actions/[actionId] → skip an action.
 *
 * User sync: On mount, we POST /api/auth/sync-user to ensure the user's
 * Clerk profile is reflected in the MongoDB User document.
 */
export default function TodayPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

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

  // Fetch today's plan (or candidate actions if no plan)
  const {
    data: todayResponse,
    isLoading,
    error,
  } = useQuery<ApiResponse<TodayResponseDto>>({
    queryKey: ["today"],
    queryFn: async () => {
      const res = await fetch("/api/today");
      if (!res.ok) throw new Error("Failed to load today's plan");
      return res.json();
    },
    enabled: isLoaded && isSignedIn,
    refetchOnWindowFocus: false,
  });

  // Generate today's plan mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/today/generate", { method: "POST" });
      const json: ApiResponse<DailyPlanDto & { hasPlan: true }> = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.success === false ? json.error : "Failed to generate plan");
      }
      return json;
    },
    onSuccess: (json) => {
      queryClient.setQueryData(["today"], { success: true, data: json.data });
      toast.success(json.message ?? "Today's plan generated!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Skip action mutation
  const skipMutation = useMutation({
    mutationFn: async (actionId: string) => {
      const res = await fetch(`/api/actions/${actionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "skipped" }),
      });
      const json: ApiResponse<{ id: string; status: string }> = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.success === false ? json.error : "Failed to skip action");
      }
      return actionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["today"] });
      toast.success("Action skipped for today");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const handleLaunch = (action: TodayActionDto) => {
    router.push(`/focus?actionId=${action.id}`);
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const todayData =
    todayResponse?.success ? todayResponse.data : undefined;
  const hasPlan = todayData?.hasPlan === true;
  const plan = hasPlan ? (todayData as DailyPlanDto & { hasPlan: true }) : null;
  const candidates = !hasPlan
    ? (todayData as CandidateActionsDto | undefined)
    : null;

  const pendingActions = plan?.actions.filter(
    (a) => a.status !== "completed" && a.status !== "skipped"
  ) ?? [];
  const completedActions = plan?.actions.filter(
    (a) => a.status === "completed"
  ) ?? [];
  const allDone = hasPlan && plan !== null && pendingActions.length === 0 && plan.totalCount > 0;

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
            <span className="text-[11px] text-blue-400 animate-pulse">Syncing...</span>
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
                elements: { avatarBox: "w-9 h-9 ring-2 ring-blue-500/30" },
              }}
            />
          </Show>
        </div>
      </div>

      {/* Daily Progress Banner */}
      {hasPlan && plan && (
        <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900/50 border border-blue-800/40 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock size={13} className="text-slate-500" />
              {plan.completedMinutes}m of {plan.targetMinutes}m
            </span>
            <span className="font-semibold text-slate-200">{plan.progressPercentage}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${plan.progressPercentage}%` }}
            />
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-500" />
              {plan.completedCount}/{plan.totalCount} actions
            </span>
            <span className="flex items-center gap-1">
              <Brain size={12} className="text-indigo-400" />
              {plan.deepWorkCount} deep work
            </span>
            <Link
              href="/profile/settings"
              className="ml-auto flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <SlidersHorizontal size={11} />
              Adjust
            </Link>
          </div>
        </div>
      )}

      {/* No plan banner */}
      {!hasPlan && !isLoading && (
        <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900/50 border border-blue-800/40 rounded-2xl p-4 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            <p className="font-medium text-slate-200">No plan generated yet</p>
            <p className="mt-0.5">Tap generate to schedule today&apos;s focus sessions.</p>
          </div>
          <Link
            href="/profile/settings"
            className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 py-1.5 px-2.5 rounded-lg bg-slate-900/40 border border-slate-800 transition-colors"
          >
            <SlidersHorizontal size={13} />
            Adjust
          </Link>
        </div>
      )}

      {/* Subtle Quote */}
      <SubtleQuote
        quote="Continuous improvement is better than delayed perfection."
        attribution="Mark Twain"
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Loading your plan...</span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-900/20 border border-red-800/40 rounded-2xl p-4 text-red-400 text-sm">
          Failed to load today&apos;s plan. Please refresh.
        </div>
      )}

      {/* All Done State */}
      {allDone && (
        <div className="bg-[#1e2235]/80 border border-emerald-700/40 rounded-2xl p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
            <CheckCircle2 size={24} className="text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">All done for today! 🎉</h3>
          <p className="text-xs text-slate-400">
            You completed {plan?.completedMinutes}m of focused work. That&apos;s a great day.
          </p>
          <button
            type="button"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="mt-2 text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
          >
            Generate more actions
          </button>
        </div>
      )}

      {/* Action Queue */}
      {hasPlan && !allDone && pendingActions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
            Up Next · {pendingActions.length} action{pendingActions.length !== 1 ? "s" : ""}
          </h2>
          {pendingActions.map((action) => (
            <TodayActionCard
              key={action.id}
              action={action}
              onLaunch={handleLaunch}
              onSkip={(id) => skipMutation.mutate(id)}
              isSkipping={skipMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Completed Actions (Collapsed) */}
      {hasPlan && completedActions.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-1">
            Completed · {completedActions.length}
          </h2>
          {completedActions.map((action) => (
            <TodayActionCard
              key={action.id}
              action={action}
              onLaunch={handleLaunch}
              onSkip={() => {}}
            />
          ))}
        </div>
      )}

      {/* No Plan — Candidate Preview + Generate CTA */}
      {!hasPlan && !isLoading && candidates && candidates.candidateCount > 0 && (
        <div className="space-y-4">
          <div className="bg-[#1e2235]/80 border border-slate-700/60 rounded-2xl p-4 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Available Actions ({candidates.candidateCount})
            </h2>
            <p className="text-xs text-slate-500">
              Kaizen will select the best mix for your time budget when you generate your plan.
            </p>
            <div className="space-y-2">
              {candidates.candidates.slice(0, 3).map((action) => (
                <div
                  key={action.id}
                  className="flex items-center gap-3 text-xs text-slate-400 bg-slate-900/40 rounded-xl px-3 py-2.5"
                >
                  <Clock size={12} className="flex-shrink-0 text-slate-500" />
                  <span className="truncate flex-1">{action.title}</span>
                  <span className="flex-shrink-0 font-mono">{action.estimatedMinutes}m</span>
                </div>
              ))}
              {candidates.candidateCount > 3 && (
                <p className="text-[11px] text-slate-500 text-center pt-1">
                  +{candidates.candidateCount - 3} more available
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
          >
            {generateMutation.isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Sparkles size={18} />
            )}
            <span>
              {generateMutation.isPending ? "Generating Plan..." : "Generate Today's Plan"}
            </span>
          </button>
        </div>
      )}

      {/* Empty State — No active goals or no decomposed roadmap */}
      {!hasPlan && !isLoading && candidates && candidates.candidateCount === 0 && (
        <div className="bg-[#1e2235]/80 border border-slate-700/60 rounded-2xl p-6 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/20">
            <Target size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-white">
              Welcome, {user?.firstName || "friend"}!
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Create a goal and decompose it with AI to unlock your daily action queue.
            </p>
          </div>
          <Link
            href="/goals/new"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-medium text-white shadow-lg shadow-blue-500/25 transition-all text-sm"
          >
            <Target size={18} />
            <span>Create Your First Goal</span>
          </Link>
        </div>
      )}
    </div>
  );
}
