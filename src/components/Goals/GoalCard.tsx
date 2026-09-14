import React from "react";
import Link from "next/link";
import { ChevronRight, Calendar, CheckCircle2 } from "lucide-react";
import { GoalSummaryDto } from "@/src/lib/validations/goalSchemas";
import { GoalWhyCallout } from "@/src/components/Goals/GoalWhyCallout";

interface GoalCardProps {
  goal: GoalSummaryDto;
}

export function GoalCard({ goal }: GoalCardProps) {
  const isCompleted = goal.status === "completed";
  const isPaused = goal.status === "paused";

  return (
    <Link
      href={`/goals/${goal.id}`}
      className="block bg-[#1e2235]/80 hover:bg-[#1e2235] border border-slate-700/60 hover:border-slate-600 rounded-2xl p-5 transition-all shadow-md group"
    >
      <div className="space-y-3">
        {/* Header with Title and Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isCompleted
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : isPaused
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                }`}
              >
                {goal.status}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar size={13} className="text-slate-500" />
                <span>{goal.targetWeeks} weeks</span>
              </span>
            </div>
            <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors">
              {goal.title}
            </h3>
          </div>

          <div className="p-1 text-slate-500 group-hover:text-white transition-colors">
            <ChevronRight size={20} />
          </div>
        </div>

        {/* Intrinsic Driver Quote */}
        {goal.whyItMatters && (
          <GoalWhyCallout
            whyItMatters={goal.whyItMatters}
            className="text-xs py-2 px-3"
          />
        )}

        {/* Milestone Progress */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-slate-500" />
              <span>
                {goal.completedMilestones} of {goal.totalMilestones} milestones
              </span>
            </span>
            <span className="font-medium text-slate-300">
              {goal.progressPercentage}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isCompleted ? "bg-emerald-500" : "bg-blue-500"
              }`}
              style={{ width: `${goal.progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
