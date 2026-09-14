import React, { useState } from "react";
import { Check, Circle, Plus, Trash2, Loader2, Flag } from "lucide-react";
import { MilestoneDto, MilestoneStatusType } from "@/src/lib/validations/goalSchemas";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiResponse } from "@/src/types/api";

interface MilestoneListProps {
  goalId: string;
  milestones: MilestoneDto[];
  readOnly?: boolean;
}

export function MilestoneList({
  goalId,
  milestones,
  readOnly = false,
}: MilestoneListProps) {
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Add Milestone Mutation
  const addMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch(`/api/goals/${goalId}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const json: ApiResponse<MilestoneDto> = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(!json.success ? json.error : "Failed to add milestone");
      }
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal", goalId] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      setNewTitle("");
      setIsAdding(false);
      toast.success("Milestone checkpoint added");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Could not add milestone");
    },
  });

  // Toggle/Update Milestone Status Mutation
  const toggleMutation = useMutation({
    mutationFn: async ({
      milestoneId,
      status,
    }: {
      milestoneId: string;
      status: MilestoneStatusType;
    }) => {
      const res = await fetch(`/api/goals/${goalId}/milestones/${milestoneId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json: ApiResponse<MilestoneDto> = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(!json.success ? json.error : "Failed to update milestone");
      }
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal", goalId] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update milestone");
    },
  });

  // Delete Milestone Mutation
  const deleteMutation = useMutation({
    mutationFn: async (milestoneId: string) => {
      const res = await fetch(`/api/goals/${goalId}/milestones/${milestoneId}`, {
        method: "DELETE",
      });
      const json: ApiResponse<{ deleted: boolean }> = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(!json.success ? json.error : "Failed to delete milestone");
      }
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal", goalId] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Milestone removed");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete milestone");
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addMutation.mutate(newTitle.trim());
  };

  const handleToggle = (milestone: MilestoneDto) => {
    if (readOnly) return;
    const newStatus: MilestoneStatusType =
      milestone.status === "completed" ? "pending" : "completed";
    toggleMutation.mutate({ milestoneId: milestone.id, status: newStatus });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Flag size={15} className="text-blue-400" />
          <span>Roadmap Checkpoints</span>
        </h3>
        {!readOnly && !isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition-colors"
          >
            <Plus size={14} />
            <span>Add Milestone</span>
          </button>
        )}
      </div>

      {/* Milestone List */}
      <div className="space-y-2">
        {milestones.length === 0 && !isAdding && (
          <div className="text-xs text-slate-500 py-3 text-center border border-dashed border-slate-800 rounded-xl">
            No milestones added yet. Break this goal into concrete checkpoints.
          </div>
        )}

        {milestones.map((m, idx) => {
          const isDone = m.status === "completed";
          return (
            <div
              key={m.id}
              className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                isDone
                  ? "bg-slate-900/40 border-slate-800 text-slate-400"
                  : "bg-[#1e2235]/60 border-slate-700/60 text-slate-200 hover:border-slate-600"
              }`}
            >
              {/* Checkbox & Title */}
              <button
                type="button"
                onClick={() => handleToggle(m)}
                disabled={readOnly || toggleMutation.isPending}
                className="flex items-center gap-3 text-left flex-1"
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors flex-shrink-0 ${
                    isDone
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                      : "border-slate-600 hover:border-blue-400 text-transparent"
                  }`}
                >
                  {isDone ? <Check size={12} strokeWidth={3} /> : <Circle size={8} />}
                </div>

                <div className="space-y-0.5">
                  <span
                    className={`text-sm ${
                      isDone ? "line-through text-slate-500" : "text-white"
                    }`}
                  >
                    {idx + 1}. {m.title}
                  </span>
                  {m.description && (
                    <p className="text-xs text-slate-400">{m.description}</p>
                  )}
                </div>
              </button>

              {/* Actions */}
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(m.id)}
                  disabled={deleteMutation.isPending}
                  className="text-slate-600 hover:text-red-400 p-1.5 rounded-lg transition-colors"
                  title="Remove checkpoint"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Inline Add Form */}
      {isAdding && (
        <form
          onSubmit={handleAddSubmit}
          className="bg-[#1e2235]/90 border border-blue-500/40 rounded-xl p-3 space-y-3"
        >
          <input
            type="text"
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. Master tree traversal and graph algorithms"
            className="w-full bg-slate-900/80 text-white placeholder-slate-500 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewTitle("");
              }}
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addMutation.isPending || !newTitle.trim()}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg disabled:opacity-50 transition-colors"
            >
              {addMutation.isPending ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Plus size={13} />
              )}
              <span>Add Checkpoint</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
