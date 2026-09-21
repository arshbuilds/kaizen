"use client";
import React, { useState } from "react";
import {
  Layers,
  Flag,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import {
  FullRoadmapDto,
  HierarchicalOutcomeDto,
  HierarchicalMilestoneDto,
  HierarchicalActionDto,
} from "@/src/lib/validations/decompositionSchemas";

interface HierarchicalRoadmapViewProps {
  roadmap: FullRoadmapDto;
  onDecomposeAgain?: () => void;
}

export function HierarchicalRoadmapView({
  roadmap,
  onDecomposeAgain,
}: HierarchicalRoadmapViewProps) {
  const [collapsedOutcomes, setCollapsedOutcomes] = useState<Record<string, boolean>>({});

  const toggleOutcome = (id: string) => {
    setCollapsedOutcomes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalHours = Math.round((roadmap.totalEstimatedMinutes / 60) * 10) / 10;
  const completedHours = Math.round((roadmap.totalCompletedMinutes / 60) * 10) / 10;
  const progressPercent =
    roadmap.totalEstimatedMinutes > 0
      ? Math.round((roadmap.totalCompletedMinutes / roadmap.totalEstimatedMinutes) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Layers size={16} className="text-blue-400" />
            <span>Structured Execution Roadmap</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {roadmap.totalOutcomes} Pillars • {roadmap.totalMilestones} Milestones • {roadmap.totalActions} Executable Actions
          </p>
        </div>

        {onDecomposeAgain && (
          <button
            type="button"
            onClick={onDecomposeAgain}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
          >
            <Sparkles size={13} />
            <span>Re-plan with AI</span>
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="bg-[#1e2235]/60 border border-slate-700/60 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            {completedHours}h of {totalHours}h planned execution
          </span>
          <span className="font-semibold text-slate-200">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Outcome Pillars List */}
      <div className="space-y-4">
        {roadmap.outcomes.map((outcome: HierarchicalOutcomeDto, oIdx: number) => {
          const isCollapsed = !!collapsedOutcomes[outcome.id];

          return (
            <div
              key={outcome.id}
              className="border border-slate-700/60 rounded-xl bg-slate-900/30 overflow-hidden shadow-sm"
            >
              {/* Outcome Banner */}
              <button
                type="button"
                onClick={() => toggleOutcome(outcome.id)}
                className="w-full flex items-center justify-between p-4 bg-[#1e2235]/80 hover:bg-[#1e2235] text-left transition-colors border-b border-slate-800"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                      Pillar {oIdx + 1}
                    </span>
                    <h4 className="text-sm font-semibold text-white">
                      {outcome.title}
                    </h4>
                  </div>
                  {outcome.description && (
                    <p className="text-xs text-slate-400 pl-0.5">
                      {outcome.description}
                    </p>
                  )}
                </div>

                <div className="text-slate-500">
                  {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                </div>
              </button>

              {/* Milestones Tree */}
              {!isCollapsed && (
                <div className="p-4 space-y-4">
                  {outcome.milestones.map(
                    (milestone: HierarchicalMilestoneDto, mIdx: number) => (
                      <div
                        key={milestone.id}
                        className="space-y-2 border-l-2 border-slate-800 pl-3 py-1"
                      >
                        {/* Milestone Title */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                            <Flag size={13} className="text-amber-400" />
                            <span>
                              {mIdx + 1}. {milestone.title}
                            </span>
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {milestone.actions.length} actions
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="space-y-1.5 pt-1">
                          {milestone.actions.map(
                            (action: HierarchicalActionDto) => {
                              const isCompleted = action.status === "completed";

                              return (
                                <div
                                  key={action.id}
                                  className={`flex items-center justify-between gap-3 p-2.5 rounded-lg border transition-all text-xs ${
                                    isCompleted
                                      ? "bg-slate-900/40 border-slate-800 text-slate-500"
                                      : "bg-[#1e2235]/60 border-slate-700/60 text-slate-200 hover:border-slate-600"
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 flex-1">
                                    <div
                                      className={`w-4 h-4 rounded-full flex items-center justify-center border flex-shrink-0 ${
                                        isCompleted
                                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                                          : "border-slate-600 text-transparent"
                                      }`}
                                    >
                                      {isCompleted ? (
                                        <CheckCircle2 size={12} />
                                      ) : (
                                        <Circle size={6} />
                                      )}
                                    </div>
                                    <span
                                      className={
                                        isCompleted
                                          ? "line-through text-slate-500"
                                          : "text-white"
                                      }
                                    >
                                      {action.title}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 flex-shrink-0 text-[11px]">
                                    <span className="text-slate-400 flex items-center gap-1">
                                      <Clock size={11} />
                                      <span>{action.estimatedMinutes}m</span>
                                    </span>

                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono ${
                                        action.cognitiveLoad === "deep_work"
                                          ? "bg-purple-950/60 text-purple-300"
                                          : action.cognitiveLoad === "learning"
                                          ? "bg-blue-950/60 text-blue-300"
                                          : "bg-slate-800 text-slate-400"
                                      }`}
                                    >
                                      {action.cognitiveLoad === "deep_work"
                                        ? "Deep"
                                        : action.cognitiveLoad === "learning"
                                        ? "Learn"
                                        : "Admin"}
                                    </span>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
