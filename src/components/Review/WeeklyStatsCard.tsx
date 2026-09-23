"use client";
import React from "react";
import { Clock, Zap, Brain, Target, TrendingUp } from "lucide-react";
import { WeeklyStatsDto } from "@/src/lib/validations/reviewSchemas";

interface WeeklyStatsCardProps {
  stats: WeeklyStatsDto;
}

/**
 * WeeklyStatsCard
 *
 * Displays the user's quantitative performance summary for the current
 * ISO week in a clean 2×2 stat grid, followed by a 7-day daily minutes
 * bar chart rendered with plain CSS (no chart library needed).
 *
 * Stats shown:
 * - Total focused minutes this week
 * - Sessions completed vs planned
 * - Deep work minutes (highest cognitive value)
 * - Goals actively worked on
 *
 * The bar chart uses relative heights so the tallest day is always
 * the full bar height, regardless of absolute minutes. This makes
 * the pattern of productive days visually clear at a glance.
 *
 * Completion rate colour coding:
 * - ≥ 80%  → emerald (great week)
 * - 50–79% → amber (decent progress)
 * - < 50%  → slate (needs attention)
 */
export function WeeklyStatsCard({ stats }: WeeklyStatsCardProps) {
  const completionColor =
    stats.sessionCompletionRate >= 80
      ? "text-emerald-400"
      : stats.sessionCompletionRate >= 50
      ? "text-amber-400"
      : "text-slate-400";

  const maxDayMinutes = Math.max(...stats.dailyMinutes.map((d) => d.minutes), 1);

  const dayLabels = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  return (
    <div className="bg-[#1e2235]/80 border border-slate-700/60 rounded-2xl p-5 space-y-5 shadow-md">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        This Week&apos;s Performance
      </h2>

      {/* Stat Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Minutes */}
        <div className="bg-slate-900/50 rounded-xl p-3.5 space-y-1 border border-slate-800/60">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Clock size={12} />
            <span>Focus Time</span>
          </div>
          <p className="text-xl font-bold text-white">
            {stats.totalCompletedMinutes >= 60
              ? `${(stats.totalCompletedMinutes / 60).toFixed(1)}h`
              : `${stats.totalCompletedMinutes}m`}
          </p>
          {stats.totalPlannedMinutes > 0 && (
            <p className="text-[11px] text-slate-500">
              of {stats.totalPlannedMinutes}m planned ({stats.minuteCompletionRate}%)
            </p>
          )}
        </div>

        {/* Sessions */}
        <div className="bg-slate-900/50 rounded-xl p-3.5 space-y-1 border border-slate-800/60">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Zap size={12} />
            <span>Sessions</span>
          </div>
          <p className={`text-xl font-bold ${completionColor}`}>
            {stats.completedSessionsCount}
            <span className="text-base font-normal text-slate-500">
              /{stats.plannedSessionsCount}
            </span>
          </p>
          <p className="text-[11px] text-slate-500">
            {stats.sessionCompletionRate}% completion
          </p>
        </div>

        {/* Deep Work */}
        <div className="bg-slate-900/50 rounded-xl p-3.5 space-y-1 border border-slate-800/60">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Brain size={12} />
            <span>Deep Work</span>
          </div>
          <p className="text-xl font-bold text-indigo-300">
            {stats.deepWorkMinutes}m
          </p>
          <p className="text-[11px] text-slate-500">
            {stats.totalCompletedMinutes > 0
              ? `${Math.round((stats.deepWorkMinutes / stats.totalCompletedMinutes) * 100)}% of sessions`
              : "No sessions yet"}
          </p>
        </div>

        {/* Goals Touched */}
        <div className="bg-slate-900/50 rounded-xl p-3.5 space-y-1 border border-slate-800/60">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Target size={12} />
            <span>Goals</span>
          </div>
          <p className="text-xl font-bold text-blue-300">
            {stats.uniqueGoalsTouched}
          </p>
          <p className="text-[11px] text-slate-500">
            {stats.uniqueGoalsTouched === 1 ? "goal worked on" : "goals worked on"}
          </p>
        </div>
      </div>

      {/* 7-Day Bar Chart */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <TrendingUp size={12} />
          <span>Daily Focus Minutes</span>
        </div>
        <div className="flex items-end gap-1.5 h-16">
          {stats.dailyMinutes.map((day, i) => {
            const heightPct = maxDayMinutes > 0
              ? Math.max(4, (day.minutes / maxDayMinutes) * 100)
              : 4;
            const isToday = day.date === new Intl.DateTimeFormat("en-CA").format(new Date());
            return (
              <div
                key={day.date}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div className="w-full flex items-end justify-center" style={{ height: "48px" }}>
                  <div
                    className={`w-full rounded-t-sm transition-all ${
                      isToday
                        ? "bg-blue-500"
                        : day.minutes > 0
                        ? "bg-slate-600"
                        : "bg-slate-800/60"
                    }`}
                    style={{ height: `${heightPct}%` }}
                    title={`${day.minutes}m`}
                  />
                </div>
                <span
                  className={`text-[10px] font-mono ${
                    isToday ? "text-blue-400" : "text-slate-600"
                  }`}
                >
                  {dayLabels[i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
