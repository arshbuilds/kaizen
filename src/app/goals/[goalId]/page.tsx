"use client";
import React, { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  PauseCircle,
  PlayCircle,
  Trash2,
  Sparkles,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GoalDto, GoalStatusType } from "@/src/lib/validations/goalSchemas";
import {
  DecomposedRoadmapDto,
  FullRoadmapDto,
} from "@/src/lib/validations/decompositionSchemas";
import { ApiResponse } from "@/src/types/api";
import { GoalWhyCallout } from "@/src/components/Goals/GoalWhyCallout";
import { MilestoneList } from "@/src/components/Goals/MilestoneList";
import { GoalDecompositionPreview } from "@/src/components/Goals/GoalDecompositionPreview";
import { HierarchicalRoadmapView } from "@/src/components/Goals/HierarchicalRoadmapView";
import { toast } from "sonner";

interface GoalDetailPageProps {
  params: Promise<{ goalId: string }>;
}

export default function GoalDetailPage({ params }: GoalDetailPageProps) {
  const { goalId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [draftRoadmap, setDraftRoadmap] = useState<DecomposedRoadmapDto | null>(null);
  const autoDecomposeTriggered = useRef(false);

  // Fetch basic goal metadata
  const {
    data: goal,
    isLoading: isGoalLoading,
    isError: isGoalError,
    error: goalError,
  } = useQuery<GoalDto>({
    queryKey: ["goal", goalId],
    queryFn: async () => {
      const res = await fetch(`/api/goals/${goalId}`);
      const json: ApiResponse<GoalDto> = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(!json.success ? json.error : "Failed to load goal");
      }
      return json.data;
    },
  });

  // Fetch hierarchical decomposed roadmap (Outcomes -> Milestones -> Actions)
  const {
    data: fullRoadmap,
    isLoading: isRoadmapLoading,
  } = useQuery<FullRoadmapDto>({
    queryKey: ["goal-roadmap", goalId],
    queryFn: async () => {
      const res = await fetch(`/api/goals/${goalId}/roadmap`);
      const json: ApiResponse<FullRoadmapDto> = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(!json.success ? json.error : "Failed to load roadmap");
      }
      return json.data;
    },
  });

  // AI Decomposition Mutation
  const decomposeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/goals/${goalId}/decompose`, {
        method: "POST",
      });
      const json: ApiResponse<DecomposedRoadmapDto> = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(!json.success ? json.error : "AI decomposition failed");
      }
      return json.data;
    },
    onSuccess: (data) => {
      setDraftRoadmap(data);
      toast.success("AI draft roadmap generated! Review and customize below.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to generate roadmap");
    },
  });

  // Check if routed from /goals/new with ?decompose=true
  useEffect(() => {
    if (
      searchParams.get("decompose") === "true" &&
      !autoDecomposeTriggered.current &&
      goal &&
      (!fullRoadmap || fullRoadmap.outcomes.length === 0)
    ) {
      autoDecomposeTriggered.current = true;
      decomposeMutation.mutate();
    }
  }, [searchParams, goal, fullRoadmap, decomposeMutation]);

  // Update Status Mutation (Pause, Resume, Complete)
  const updateStatusMutation = useMutation({
    mutationFn: async (status: GoalStatusType) => {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json: ApiResponse<GoalDto> = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(!json.success ? json.error : "Failed to update goal status");
      }
      return json.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["goal", goalId] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success(`Goal status updated to ${data.status}`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update status");
    },
  });

  // Delete Goal Mutation
  const deleteGoalMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: "DELETE",
      });
      const json: ApiResponse<{ deleted: boolean }> = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(!json.success ? json.error : "Failed to delete goal");
      }
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Goal deleted");
      router.push("/goals");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete goal");
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this goal and its roadmap?")) {
      deleteGoalMutation.mutate();
    }
  };

  if (isGoalLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 pb-28 pt-8 max-w-lg mx-auto flex flex-col items-center justify-center space-y-3">
        <Loader2 size={24} className="animate-spin text-blue-500" />
        <span className="text-xs text-slate-400">Loading goal details...</span>
      </div>
    );
  }

  if (isGoalError || !goal) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 pb-28 pt-8 max-w-lg mx-auto space-y-4">
        <Link
          href="/goals"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          <span>Back to Goals</span>
        </Link>
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center text-red-400 text-sm">
          {goalError instanceof Error ? goalError.message : "Goal not found"}
        </div>
      </div>
    );
  }

  const isCompleted = goal.status === "completed";
  const isPaused = goal.status === "paused";
  const hasHierarchicalRoadmap = fullRoadmap && fullRoadmap.outcomes.length > 0;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 pb-28 pt-6 max-w-lg mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/goals"
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {goal.status === "active" ? (
            <button
              type="button"
              onClick={() => updateStatusMutation.mutate("paused")}
              disabled={updateStatusMutation.isPending}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Pause Goal"
            >
              <PauseCircle size={14} />
              <span>Pause</span>
            </button>
          ) : goal.status === "paused" ? (
            <button
              type="button"
              onClick={() => updateStatusMutation.mutate("active")}
              disabled={updateStatusMutation.isPending}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Resume Goal"
            >
              <PlayCircle size={14} />
              <span>Resume</span>
            </button>
          ) : null}

          {!isCompleted && (
            <button
              type="button"
              onClick={() => updateStatusMutation.mutate("completed")}
              disabled={updateStatusMutation.isPending}
              className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Mark Completed"
            >
              <CheckCircle2 size={14} />
              <span>Complete</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteGoalMutation.isPending}
            className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
            title="Delete Goal"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Goal Title & Metadata Header */}
      <div className="bg-[#1e2235]/80 border border-slate-700/60 rounded-2xl p-5 space-y-4 shadow-md">
        <div className="space-y-2">
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

          <h1 className="text-xl font-bold text-white leading-snug">
            {goal.title}
          </h1>
        </div>

        {/* Intrinsic Driver Quote */}
        {goal.whyItMatters && (
          <GoalWhyCallout whyItMatters={goal.whyItMatters} />
        )}

        {/* Progress & Time Stats */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-slate-500" />
              <span>
                {goal.completedMilestones} of {goal.totalMilestones} checkpoints
              </span>
            </span>
            <span className="font-semibold text-slate-200">
              {goal.progressPercentage}%
            </span>
          </div>

          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isCompleted ? "bg-emerald-500" : "bg-blue-500"
              }`}
              style={{ width: `${goal.progressPercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              <span>
                {goal.totalEstimatedMinutes > 0
                  ? `${Math.round(goal.totalEstimatedMinutes / 60)}h planned`
                  : `${goal.totalCompletedMinutes}m completed`}
              </span>
            </span>
            <span>Target: ~{goal.targetWeeks}w</span>
          </div>
        </div>
      </div>

      {/* AI Draft Decomposition Preview (If user triggered decompose) */}
      {draftRoadmap && (
        <GoalDecompositionPreview
          goalId={goal.id}
          initialRoadmap={draftRoadmap}
          onCommitted={() => {
            setDraftRoadmap(null);
            queryClient.invalidateQueries({ queryKey: ["goal-roadmap", goalId] });
          }}
          onCancel={() => setDraftRoadmap(null)}
        />
      )}

      {/* Decompose Callout Banner (When no hierarchical roadmap exists and not currently previewing) */}
      {!hasHierarchicalRoadmap && !draftRoadmap && (
        <div className="bg-gradient-to-r from-indigo-950/40 via-blue-950/30 to-[#1e2235]/90 border border-indigo-500/30 rounded-2xl p-5 space-y-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Decompose into Executable Actions
              </h3>
              <p className="text-xs text-slate-400">
                Let Kaizen AI break this {goal.targetWeeks}-week goal into concrete pillars, milestones, and 15–90 min tasks.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => decomposeMutation.mutate()}
            disabled={decomposeMutation.isPending}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white text-xs shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
          >
            {decomposeMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Reasoning & Structuring Curriculum...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Decompose Roadmap with Gemini</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Loading state for hierarchical roadmap */}
      {isRoadmapLoading && (
        <div className="bg-[#1e2235]/40 border border-slate-800 rounded-2xl p-6 flex items-center justify-center gap-2 text-slate-400 text-xs">
          <Loader2 size={16} className="animate-spin text-blue-400" />
          <span>Loading roadmap tree...</span>
        </div>
      )}

      {/* Full Hierarchical Roadmap View (When committed) */}
      {hasHierarchicalRoadmap && !draftRoadmap && fullRoadmap && (
        <HierarchicalRoadmapView
          roadmap={fullRoadmap}
          onDecomposeAgain={() => decomposeMutation.mutate()}
        />
      )}

      {/* Checkpoint Milestone List (Always available for manual control) */}
      {(!hasHierarchicalRoadmap || fullRoadmap?.outcomes.length === 0) && (
        <div className="bg-[#1e2235]/80 border border-slate-700/60 rounded-2xl p-5 shadow-md">
          <MilestoneList
            goalId={goal.id}
            milestones={goal.milestones}
            readOnly={isCompleted}
          />
        </div>
      )}
    </div>
  );
}
