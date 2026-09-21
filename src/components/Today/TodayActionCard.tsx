"use client";
import React from "react";
import { SkipForward, Brain, BookOpen, Inbox, Clock, Zap } from "lucide-react";
import { TodayActionDto } from "@/src/lib/validations/dailyPlanSchemas";

interface TodayActionCardProps {
  action: TodayActionDto;
  onLaunch: (action: TodayActionDto) => void;
  onSkip: (actionId: string) => void;
  isSkipping?: boolean;
}

/**
 * TodayActionCard
 *
 * Renders a single action item in the Today's Plan queue.
 *
 * Displays:
 * - Goal and Milestone breadcrumb (e.g. "Learn Kafka → Core Architecture")
 * - Action title (the concrete task to execute)
 * - Duration badge, cognitive load badge, difficulty badge
 * - "Launch Focus" primary CTA → navigates to /focus?actionId=...
 * - "Skip" secondary action → removes from today's queue
 *
 * Cognitive Load colour coding:
 * - deep_work  → indigo/purple  (demands full attention, zero interruptions)
 * - learning   → amber/yellow   (reading, studying, absorbing)
 * - shallow_work → slate/green  (mechanical, can tolerate context switches)
 *
 * This component is purely presentational — all mutations are lifted to
 * the parent Today page via callbacks.
 */
export function TodayActionCard({
  action,
  onLaunch,
  onSkip,
  isSkipping = false,
}: TodayActionCardProps) {
  const isCompleted = action.status === "completed";
  const isSkipped = action.status === "skipped";

  // Cognitive load visual configuration
  const cogLoadConfig = {
    deep_work: {
      icon: <Brain size={12} />,
      label: "Deep Work",
      className: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
      cardAccent: "border-l-indigo-500",
    },
    learning: {
      icon: <BookOpen size={12} />,
      label: "Learning",
      className: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      cardAccent: "border-l-amber-500",
    },
    shallow_work: {
      icon: <Inbox size={12} />,
      label: "Shallow",
      className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      cardAccent: "border-l-emerald-500",
    },
  } as const;

  const difficultyConfig = {
    easy: { label: "Easy", className: "bg-slate-700/60 text-slate-400" },
    medium: { label: "Medium", className: "bg-slate-700/60 text-orange-300" },
    hard: { label: "Hard", className: "bg-red-900/30 text-red-400" },
  } as const;

  const cogLoad = cogLoadConfig[action.cognitiveLoad];
  const difficulty = difficultyConfig[action.difficulty];

  if (isCompleted) {
    return (
      <div className="bg-[#1e2235]/40 border border-slate-800/60 rounded-2xl p-4 opacity-60">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-400 line-through truncate">{action.title}</p>
            <p className="text-xs text-emerald-500/70 mt-0.5">
              Completed · {action.actualMinutes}m
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isSkipped) {
    return null; // Skipped actions are hidden from the queue
  }

  return (
    <div
      className={`bg-[#1e2235]/80 border border-slate-700/60 border-l-2 ${cogLoad.cardAccent} rounded-2xl p-4 space-y-3 shadow-md`}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono truncate">
        <span className="text-slate-400 truncate max-w-[120px]">{action.goalTitle}</span>
        <span>›</span>
        <span className="truncate max-w-[140px]">{action.milestoneTitle}</span>
      </div>

      {/* Action Title */}
      <p className="text-sm font-semibold text-slate-100 leading-snug">
        {action.title}
      </p>

      {/* Badges Row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Duration */}
        <span className="flex items-center gap-1 text-[11px] font-medium bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700/60">
          <Clock size={11} />
          {action.estimatedMinutes}m
        </span>

        {/* Cognitive Load */}
        <span
          className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${cogLoad.className}`}
        >
          {cogLoad.icon}
          {cogLoad.label}
        </span>

        {/* Difficulty */}
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${difficulty.className}`}>
          {difficulty.label}
        </span>
      </div>

      {/* Actions Row */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => onLaunch(action)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-sm shadow-blue-500/20"
        >
          <Zap size={14} className="fill-current" />
          <span>Launch Focus</span>
        </button>

        <button
          type="button"
          onClick={() => onSkip(action.id)}
          disabled={isSkipping}
          className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 transition-colors border border-slate-700/60 disabled:opacity-50"
          title="Skip for today"
        >
          <SkipForward size={16} />
        </button>
      </div>
    </div>
  );
}
