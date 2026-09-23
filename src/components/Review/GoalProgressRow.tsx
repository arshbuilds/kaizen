"use client";
import React from "react";
import { GoalWeeklyBreakdown } from "@/src/lib/validations/reviewSchemas";

interface GoalProgressRowProps {
  breakdown: GoalWeeklyBreakdown;
}

/**
 * GoalProgressRow
 *
 * Displays a single goal's weekly execution summary as a compact row.
 * Shows the goal title, session count, minutes logged, and a proportional
 * progress bar representing the session completion rate.
 *
 * Colour coding of the progress bar follows the same convention as
 * WeeklyStatsCard:
 * - ≥ 80% → emerald (strong execution)
 * - 50–79% → amber (partial)
 * - < 50% → blue (needs focus)
 *
 * This component is designed to be rendered in a vertical list, not a grid.
 * All layout is handled by the parent (ReviewPage).
 */
export function GoalProgressRow({ breakdown }: GoalProgressRowProps) {
  const { goalTitle, completedMinutes, completedSessions, totalSessions, completionRate } =
    breakdown;

  const barColor =
    completionRate >= 80
      ? "bg-emerald-500"
      : completionRate >= 50
      ? "bg-amber-500"
      : "bg-blue-500";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-200 truncate flex-1">
          {goalTitle}
        </p>
        <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-shrink-0">
          <span>{completedSessions}/{totalSessions} sessions</span>
          <span className="text-slate-600">·</span>
          <span>{completedMinutes}m</span>
        </div>
      </div>
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${completionRate}%` }}
        />
      </div>
      <p className="text-[10px] text-slate-600 text-right">{completionRate}% complete</p>
    </div>
  );
}
