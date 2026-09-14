"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Target, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateGoalInput, GoalDto } from "@/src/lib/validations/goalSchemas";
import { ApiResponse } from "@/src/types/api";

export default function NewGoalPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [whyItMatters, setWhyItMatters] = useState("");
  const [targetWeeks, setTargetWeeks] = useState(12);
  const [milestones, setMilestones] = useState<string[]>([""]);

  const handleMilestoneChange = (index: number, value: string) => {
    const updated = [...milestones];
    updated[index] = value;
    setMilestones(updated);
  };

  const handleAddMilestoneField = () => {
    setMilestones([...milestones, ""]);
  };

  const handleRemoveMilestoneField = (index: number) => {
    setMilestones(milestones.filter((_, idx) => idx !== index));
  };

  const createGoalMutation = useMutation({
    mutationFn: async (payload: CreateGoalInput) => {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json: ApiResponse<GoalDto> = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(!json.success ? json.error : "Failed to create goal");
      }
      return json.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Goal created successfully");
      router.push(`/goals/${data.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create goal");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (title.trim().length < 2) {
      toast.error("Please enter a goal title of at least 2 characters");
      return;
    }

    if (whyItMatters.trim().length < 3) {
      toast.error("Please describe why this goal matters to you");
      return;
    }

    const cleanedMilestones = milestones
      .map((m) => m.trim())
      .filter((m) => m.length > 0)
      .map((title, idx) => ({
        title,
        status: "pending" as const,
        order: idx,
      }));

    const payload: CreateGoalInput = {
      title: title.trim(),
      whyItMatters: whyItMatters.trim(),
      targetWeeks: Number(targetWeeks),
      milestones: cleanedMilestones,
    };

    createGoalMutation.mutate(payload);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 pb-28 pt-6 max-w-lg mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/goals"
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Target className="text-blue-500" size={24} />
            <span>Create Goal</span>
          </h1>
          <p className="text-xs text-slate-400">
            Define your destination and the intrinsic reason behind it
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Goal Objective */}
        <div className="bg-[#1e2235]/80 border border-slate-700/60 rounded-2xl p-5 space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            Goal Objective
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Land a Senior Backend Engineer role"
            className="w-full bg-slate-900/60 text-white placeholder-slate-500 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-[11px] text-slate-400">
            State who you want to become or what major capability you want to build.
          </p>
        </div>

        {/* Why this matters (Intrinsic driver) */}
        <div className="bg-[#1e2235]/80 border border-slate-700/60 rounded-2xl p-5 space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Why This Matters (Intrinsic Driver)
          </label>
          <textarea
            rows={3}
            required
            value={whyItMatters}
            onChange={(e) => setWhyItMatters(e.target.value)}
            placeholder="e.g. To master distributed systems, gain architectural autonomy, and create lasting leverage."
            className="w-full bg-slate-900/60 text-white placeholder-slate-500 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <p className="text-[11px] text-slate-400">
            This will be kept visible during planning to keep your focus grounded.
          </p>
        </div>

        {/* Target Timeframe */}
        <div className="bg-[#1e2235]/80 border border-slate-700/60 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Target Timeframe
            </label>
            <span className="text-sm font-bold text-white">
              {targetWeeks} {targetWeeks === 1 ? "week" : "weeks"}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={52}
            value={targetWeeks}
            onChange={(e) => setTargetWeeks(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>1w (Sprint)</span>
            <span>12w (Quarter)</span>
            <span>26w (Half-year)</span>
            <span>52w (Year)</span>
          </div>
        </div>

        {/* Optional Starting Milestones */}
        <div className="bg-[#1e2235]/80 border border-slate-700/60 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Initial Checkpoints (Optional)
            </label>
            <button
              type="button"
              onClick={handleAddMilestoneField}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            >
              <Plus size={13} />
              <span>Add Checkpoint</span>
            </button>
          </div>

          <div className="space-y-2">
            {milestones.map((milestone, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={milestone}
                  onChange={(e) => handleMilestoneChange(idx, e.target.value)}
                  placeholder={`Checkpoint #${idx + 1} (e.g. Master Kafka fundamentals)`}
                  className="flex-1 bg-slate-900/60 text-white placeholder-slate-500 border border-slate-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {milestones.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMilestoneField(idx)}
                    className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={createGoalMutation.isPending}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
        >
          {createGoalMutation.isPending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Target size={18} />
          )}
          <span>
            {createGoalMutation.isPending
              ? "Saving Goal..."
              : "Create Goal & Open Roadmap"}
          </span>
        </button>
      </form>
    </div>
  );
}
