"use client";
import React, { useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Brain, BookOpen, Inbox, Clock } from "lucide-react";
import Link from "next/link";
import { ApiResponse } from "@/src/types/api";
import {
  TodayResponseDto,
  DailyPlanDto,
  TodayActionDto,
  FocusCompleteResultDto,
} from "@/src/lib/validations/dailyPlanSchemas";
import { FocusTimer } from "@/src/components/Focus/FocusTimer";
import { SessionCompletionModal } from "@/src/components/Focus/SessionCompletionModal";

/**
 * FocusPageInner — wrapped in Suspense due to useSearchParams()
 *
 * The distraction-free execution environment.
 *
 * URL parameter: `?actionId=<id>` — identifies which action is being executed.
 * If no actionId is provided, or the plan doesn't contain the action,
 * the page shows an empty state prompting the user to select an action.
 *
 * Session lifecycle:
 * 1. Timer starts (user clicks Play).
 * 2. User works until timer completes (auto) or clicks "Finish Early".
 * 3. POST /api/focus/complete is called with `{ actionId, actualMinutes }`.
 * 4. SessionCompletionModal appears with cascade results.
 * 5. User navigates back to Today's Plan or to the Goal page.
 *
 * Cognitive load display:
 * The action's `cognitiveLoad` field drives the page accent colour, so the
 * visual environment matches the mental mode required by the task.
 */
function FocusPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const actionId = searchParams.get("actionId");

  const [sessionComplete, setSessionComplete] = useState(false);
  const [actualMinutes, setActualMinutes] = useState<number | null>(null);
  const [completeResult, setCompleteResult] = useState<FocusCompleteResultDto | null>(null);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  // Fetch today's plan to get action details
  const { data: todayResponse, isLoading } = useQuery<ApiResponse<TodayResponseDto>>({
    queryKey: ["today"],
    queryFn: async () => {
      const res = await fetch("/api/today");
      if (!res.ok) throw new Error("Failed to load plan");
      return res.json();
    },
    staleTime: 1000 * 60 * 2, // 2 minutes — avoid unnecessary re-fetches during a session
  });

  // Extract the specific action from the plan
  const plan =
    todayResponse?.success && todayResponse.data.hasPlan === true
      ? (todayResponse.data as DailyPlanDto & { hasPlan: true })
      : null;

  const action: TodayActionDto | undefined = plan?.actions.find(
    (a) => a.id === actionId
  );

  // Cognitive load accent configuration
  const cogLoadStyle = {
    deep_work: {
      badge: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
      icon: <Brain size={14} />,
      label: "Deep Work",
      accentClass: "text-indigo-400",
    },
    learning: {
      badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      icon: <BookOpen size={14} />,
      label: "Learning",
      accentClass: "text-amber-400",
    },
    shallow_work: {
      badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      icon: <Inbox size={14} />,
      label: "Shallow Work",
      accentClass: "text-emerald-400",
    },
  } as const;

  const cogStyle = action ? cogLoadStyle[action.cognitiveLoad] : null;

  const completeSession = useCallback(
    async (minutes: number) => {
      if (!actionId) return;
      setActualMinutes(minutes);
      setSessionComplete(true);
      setIsCompleting(true);
      setCompleteError(null);

      try {
        const res = await fetch("/api/focus/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ actionId, actualMinutes: minutes }),
        });
        const json: ApiResponse<FocusCompleteResultDto> = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.success === false ? json.error : "Failed to log session");
        }
        setCompleteResult(json.data);
      } catch (err) {
        setCompleteError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsCompleting(false);
      }
    },
    [actionId]
  );

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col items-center justify-between p-6 relative">
      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-between pt-4">
        <Link
          href="/today"
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
          Focus Mode
        </span>
        <div className="w-9" />
      </div>

      {/* Main Focus Display */}
      <div className="w-full max-w-md flex flex-col items-center text-center my-auto space-y-6">
        {isLoading && (
          <p className="text-slate-400 text-sm animate-pulse">Loading session...</p>
        )}

        {!isLoading && !action && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-slate-100">Ready to Begin</h1>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">
              Select an action from Today&apos;s Plan to launch your focused work session.
            </p>
            <Link
              href="/today"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-all"
            >
              View Today&apos;s Plan
            </Link>
          </div>
        )}

        {!isLoading && action && (
          <div className="w-full space-y-6">
            {/* Action Context */}
            <div className="space-y-2">
              {/* Breadcrumb */}
              <p className="text-[11px] text-slate-500 font-mono">
                {action.goalTitle} › {action.milestoneTitle}
              </p>

              {/* Action Title */}
              <h1 className="text-xl font-bold text-slate-100 leading-snug max-w-xs mx-auto">
                {action.title}
              </h1>

              {/* Badges */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {cogStyle && (
                  <span
                    className={`flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border ${cogStyle.badge}`}
                  >
                    {cogStyle.icon}
                    {cogStyle.label}
                  </span>
                )}
                <span className="flex items-center gap-1 text-[11px] font-medium bg-slate-800/80 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700/60">
                  <Clock size={11} />
                  {action.estimatedMinutes}m session
                </span>
              </div>
            </div>

            {/* Timer */}
            <FocusTimer
              durationMinutes={action.estimatedMinutes}
              onComplete={completeSession}
              onFinishEarly={completeSession}
            />
          </div>
        )}
      </div>

      <div className="pb-24 text-xs text-slate-600 text-center">
        Distraction-free environment · Telemetry active
      </div>

      {/* Session Completion Overlay */}
      {sessionComplete && (
        <SessionCompletionModal
          actionTitle={action?.title ?? "Session"}
          actualMinutes={actualMinutes ?? 1}
          result={completeResult}
          isLoading={isCompleting}
          error={completeError}
          onContinue={() => router.push("/today")}
          onViewGoal={(goalId) => router.push(`/goals/${goalId}`)}
        />
      )}
    </div>
  );
}

export default function FocusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-slate-400 text-sm">
          Loading...
        </div>
      }
    >
      <FocusPageInner />
    </Suspense>
  );
}
