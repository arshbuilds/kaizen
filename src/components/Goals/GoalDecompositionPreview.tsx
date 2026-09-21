"use client";
import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Layers,
  Flag,
  Loader2,
} from "lucide-react";
import {
  DecomposedRoadmapDto,
  DecomposedOutcomeDto,
  DecomposedMilestoneDto,
  DecomposedActionDto,
  CommitRoadmapInput,
} from "@/src/lib/validations/decompositionSchemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiResponse } from "@/src/types/api";

interface GoalDecompositionPreviewProps {
  goalId: string;
  initialRoadmap: DecomposedRoadmapDto;
  onCommitted: () => void;
  onCancel: () => void;
}

export function GoalDecompositionPreview({
  goalId,
  initialRoadmap,
  onCommitted,
  onCancel,
}: GoalDecompositionPreviewProps) {
  const queryClient = useQueryClient();
  const [roadmap, setRoadmap] = useState<DecomposedRoadmapDto>(initialRoadmap);
  const [collapsedOutcomes, setCollapsedOutcomes] = useState<Record<number, boolean>>({});

  // Toggle collapse for an outcome
  const toggleOutcome = (idx: number) => {
    setCollapsedOutcomes((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Modify action title
  const handleActionTitleChange = (
    outcomeIdx: number,
    milestoneIdx: number,
    actionIdx: number,
    newTitle: string
  ) => {
    const updated = { ...roadmap };
    updated.outcomes[outcomeIdx].milestones[milestoneIdx].actions[actionIdx].title =
      newTitle;
    setRoadmap(updated);
  };

  // Modify action duration
  const handleActionMinutesChange = (
    outcomeIdx: number,
    milestoneIdx: number,
    actionIdx: number,
    minutes: number
  ) => {
    const updated = { ...roadmap };
    updated.outcomes[outcomeIdx].milestones[milestoneIdx].actions[
      actionIdx
    ].estimatedMinutes = minutes;
    setRoadmap(updated);
  };

  // Delete an action
  const handleDeleteAction = (
    outcomeIdx: number,
    milestoneIdx: number,
    actionIdx: number
  ) => {
    const updated = { ...roadmap };
    const actions =
      updated.outcomes[outcomeIdx].milestones[milestoneIdx].actions;
    if (actions.length <= 1) {
      toast.error("Milestone must keep at least 1 action");
      return;
    }
    updated.outcomes[outcomeIdx].milestones[milestoneIdx].actions = actions.filter(
      (_, idx) => idx !== actionIdx
    );
    setRoadmap(updated);
  };

  // Add an action
  const handleAddAction = (outcomeIdx: number, milestoneIdx: number) => {
    const updated = { ...roadmap };
    const newAction: DecomposedActionDto = {
      title: "New executable action",
      estimatedMinutes: 45,
      cognitiveLoad: "deep_work",
      difficulty: "medium",
    };
    updated.outcomes[outcomeIdx].milestones[milestoneIdx].actions.push(newAction);
    setRoadmap(updated);
  };

  // Compute summary stats dynamically
  let totalMinutes = 0;
  let totalActions = 0;
  let totalMilestones = 0;

  roadmap.outcomes.forEach((outcome) => {
    outcome.milestones.forEach((milestone) => {
      totalMilestones++;
      milestone.actions.forEach((act) => {
        totalActions++;
        totalMinutes += act.estimatedMinutes;
      });
    });
  });

  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  // Commit mutation
  const commitMutation = useMutation({
    mutationFn: async (payload: CommitRoadmapInput) => {
      const res = await fetch(`/api/goals/${goalId}/commit-roadmap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json: ApiResponse<unknown> = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(!json.success ? json.error : "Failed to commit roadmap");
      }
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal", goalId] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal-roadmap", goalId] });
      toast.success("Roadmap approved and activated!");
      onCommitted();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to commit roadmap");
    },
  });

  const handleApprove = () => {
    const payload: CommitRoadmapInput = {
      outcomes: roadmap.outcomes.map((o, oIdx) => ({
        title: o.title,
        description: o.description,
        order: oIdx,
        milestones: o.milestones.map((m, mIdx) => ({
          title: m.title,
          description: m.description,
          order: mIdx,
          actions: m.actions.map((a) => ({
            title: a.title,
            description: a.description,
            estimatedMinutes: a.estimatedMinutes,
            cognitiveLoad: a.cognitiveLoad,
            difficulty: a.difficulty,
          })),
        })),
      })),
    };

    commitMutation.mutate(payload);
  };

  return (
    <div className="bg-[#1e2235]/95 border border-indigo-500/40 rounded-2xl p-5 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Sparkles size={16} />
            </span>
            <h2 className="text-base font-semibold text-white">
              AI Proposed Roadmap Preview
            </h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {roadmap.summary}
          </p>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs">
        <div>
          <span className="text-slate-400 block text-[11px]">Pillars</span>
          <span className="font-semibold text-white">{roadmap.outcomes.length}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Milestones</span>
          <span className="font-semibold text-white">{totalMilestones}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Total Effort</span>
          <span className="font-semibold text-blue-400">
            {totalHours}h ({totalActions} tasks)
          </span>
        </div>
      </div>

      {/* Hierarchy Tree */}
      <div className="space-y-4">
        {roadmap.outcomes.map((outcome: DecomposedOutcomeDto, oIdx: number) => {
          const isCollapsed = !!collapsedOutcomes[oIdx];

          return (
            <div
              key={oIdx}
              className="border border-slate-800 rounded-xl bg-slate-900/40 overflow-hidden"
            >
              {/* Outcome Header */}
              <button
                type="button"
                onClick={() => toggleOutcome(oIdx)}
                className="w-full flex items-center justify-between p-3.5 bg-slate-900/80 hover:bg-slate-850 text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1 rounded bg-blue-500/10 text-blue-400">
                    <Layers size={14} />
                  </span>
                  <div>
                    <span className="text-xs font-semibold text-white">
                      Outcome {oIdx + 1}: {outcome.title}
                    </span>
                    {outcome.description && (
                      <p className="text-[11px] text-slate-400">
                        {outcome.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-slate-400">
                  {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {/* Milestones and Actions */}
              {!isCollapsed && (
                <div className="p-3 space-y-3">
                  {outcome.milestones.map(
                    (milestone: DecomposedMilestoneDto, mIdx: number) => (
                      <div
                        key={mIdx}
                        className="border border-slate-800/80 rounded-lg p-3 bg-[#1e2235]/40 space-y-2.5"
                      >
                        {/* Milestone Title */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-300 flex items-center gap-1.5">
                            <Flag size={12} className="text-amber-400" />
                            <span>
                              Checkpoint {mIdx + 1}: {milestone.title}
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddAction(oIdx, mIdx)}
                            className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                          >
                            <Plus size={12} />
                            <span>Add Action</span>
                          </button>
                        </div>

                        {/* Actions List */}
                        <div className="space-y-1.5 pl-2">
                          {milestone.actions.map(
                            (action: DecomposedActionDto, aIdx: number) => (
                              <div
                                key={aIdx}
                                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs"
                              >
                                <input
                                  type="text"
                                  value={action.title}
                                  onChange={(e) =>
                                    handleActionTitleChange(
                                      oIdx,
                                      mIdx,
                                      aIdx,
                                      e.target.value
                                    )
                                  }
                                  className="flex-1 bg-transparent text-white border-b border-transparent hover:border-slate-600 focus:border-blue-500 focus:outline-none px-1 py-0.5 text-xs"
                                />

                                {/* Duration Selector */}
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <select
                                    value={action.estimatedMinutes}
                                    onChange={(e) =>
                                      handleActionMinutesChange(
                                        oIdx,
                                        mIdx,
                                        aIdx,
                                        Number(e.target.value)
                                      )
                                    }
                                    className="bg-slate-800 text-slate-300 rounded px-1.5 py-0.5 text-[11px] border border-slate-700"
                                  >
                                    <option value={15}>15m</option>
                                    <option value={30}>30m</option>
                                    <option value={45}>45m</option>
                                    <option value={60}>60m</option>
                                    <option value={90}>90m</option>
                                  </select>

                                  {/* Cognitive Tag */}
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono ${
                                      action.cognitiveLoad === "deep_work"
                                        ? "bg-purple-950/60 text-purple-300 border border-purple-800/40"
                                        : action.cognitiveLoad === "learning"
                                        ? "bg-blue-950/60 text-blue-300 border border-blue-800/40"
                                        : "bg-slate-800 text-slate-400"
                                    }`}
                                  >
                                    {action.cognitiveLoad === "deep_work"
                                      ? "Deep"
                                      : action.cognitiveLoad === "learning"
                                      ? "Learn"
                                      : "Admin"}
                                  </span>

                                  {/* Delete Button */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteAction(oIdx, mIdx, aIdx)
                                    }
                                    className="p-1 text-slate-600 hover:text-red-400 transition-colors"
                                    title="Delete action"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            )
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

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          disabled={commitMutation.isPending}
          className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
        >
          Discard Preview
        </button>
        <button
          type="button"
          onClick={handleApprove}
          disabled={commitMutation.isPending}
          className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-white text-xs shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
        >
          {commitMutation.isPending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <CheckCircle size={15} />
          )}
          <span>
            {commitMutation.isPending
              ? "Saving Roadmap..."
              : "Approve & Activate Roadmap"}
          </span>
        </button>
      </div>
    </div>
  );
}
