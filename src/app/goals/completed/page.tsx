"use client";
import React from "react";
import Link from "next/link";
import { CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { GoalSummaryDto } from "@/src/lib/validations/goalSchemas";
import { ApiResponse } from "@/src/types/api";
import { GoalCard } from "@/src/components/Goals/GoalCard";

export default function CompletedGoalsPage() {
  const {
    data: goals = [],
    isLoading,
    isError,
    error,
  } = useQuery<GoalSummaryDto[]>({
    queryKey: ["goals", "completed"],
    queryFn: async () => {
      const res = await fetch(`/api/goals?status=completed`);
      const json: ApiResponse<GoalSummaryDto[]> = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(!json.success ? json.error : "Failed to load completed goals");
      }
      return json.data;
    },
  });

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 pb-28 pt-6 max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/goals"
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CheckCircle className="text-emerald-400" size={24} />
            <span>Completed Goals</span>
          </h1>
          <p className="text-xs text-slate-400">
            Your archive of accomplished milestones and journeys
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
          <Loader2 size={24} className="animate-spin text-emerald-500" />
          <span className="text-xs">Loading archived goals...</span>
        </div>
      )}

      {isError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
          {error instanceof Error ? error.message : "Failed to load archive"}
        </div>
      )}

      {!isLoading && !isError && goals.length > 0 && (
        <div className="space-y-4">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}

      {!isLoading && !isError && goals.length === 0 && (
        <div className="bg-[#1e2235]/80 border border-slate-700/60 rounded-2xl p-8 text-center text-slate-400 text-sm">
          No completed goals archived yet. Keep executing daily!
        </div>
      )}
    </div>
  );
}
