"use client";
import React from "react";
import { CheckCircle, ChevronRight, Loader2, Trophy } from "lucide-react";
import { FocusCompleteResultDto } from "@/src/lib/validations/dailyPlanSchemas";

interface SessionCompletionModalProps {
  actionTitle: string;
  actualMinutes: number;
  result: FocusCompleteResultDto | null;
  isLoading: boolean;
  error: string | null;
  onContinue: () => void;   // Go back to today's plan
  onViewGoal: (goalId: string) => void;
}

/**
 * SessionCompletionModal
 *
 * Displayed as an overlay after a focus session is successfully logged.
 * Shows:
 * - The completed action title and actual time spent
 * - A congratulatory badge if a Milestone was completed (cascade trigger)
 * - Progress delta: how much of today's plan is now done
 * - CTA buttons: "Continue Today's Plan" or "View Goal Progress"
 *
 * This component renders over the focus page (not as a traditional modal)
 * using a full-screen overlay, keeping the user in the distraction-free
 * environment until they explicitly navigate away.
 *
 * It handles three states:
 * 1. `isLoading = true` → spinner while API call completes
 * 2. `error !== null` → error message with retry prompt
 * 3. `result !== null` → success UI with cascade details
 */
export function SessionCompletionModal({
  actionTitle,
  actualMinutes,
  result,
  isLoading,
  error,
  onContinue,
  onViewGoal,
}: SessionCompletionModalProps) {
  return (
    <div className="absolute inset-0 bg-[#0b0f19]/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-50">
      <div className="w-full max-w-sm space-y-6">
        {isLoading && (
          <div className="text-center space-y-4">
            <Loader2 size={40} className="animate-spin text-blue-400 mx-auto" />
            <p className="text-slate-400 text-sm">Logging your session...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="text-center space-y-4">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              type="button"
              onClick={onContinue}
              className="text-xs text-slate-400 hover:text-slate-200 underline"
            >
              Go back to Today
            </button>
          </div>
        )}

        {result && !isLoading && (
          <>
            {/* Main completion card */}
            <div className="bg-[#1e2235]/80 border border-slate-700/60 rounded-2xl p-6 text-center space-y-4">
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                {result.milestoneCompleted ? (
                  <Trophy size={28} className="text-amber-400" />
                ) : (
                  <CheckCircle size={28} className="text-emerald-400" />
                )}
              </div>

              {/* Session result */}
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-white">
                  {result.milestoneCompleted ? "Milestone Complete! 🎯" : "Session Complete!"}
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                  <span className="text-slate-200 font-medium">{actionTitle}</span>
                  <br />
                  {actualMinutes} minute{actualMinutes !== 1 ? "s" : ""} of focused work logged.
                </p>
              </div>

              {/* Milestone completed callout */}
              {result.milestoneCompleted && result.milestoneTitle && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-center">
                  <p className="text-xs text-amber-300 font-semibold">
                    ✓ Milestone unlocked the next checkpoint!
                  </p>
                  <p className="text-[11px] text-amber-400/70 mt-0.5 truncate">
                    {result.milestoneTitle}
                  </p>
                </div>
              )}

              {/* Today progress */}
              <div className="bg-slate-900/60 rounded-xl p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Today&apos;s Progress</span>
                  <span className="font-semibold text-slate-200">
                    {result.planProgressPercentage}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${result.planProgressPercentage}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 text-right">
                  {result.planCompletedMinutes}m completed today
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={onContinue}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 transition-all"
              >
                <span>Continue Today&apos;s Plan</span>
                <ChevronRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => onViewGoal(result.goalId)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 font-medium text-sm border border-slate-700/60 transition-all"
              >
                View Goal Progress
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
