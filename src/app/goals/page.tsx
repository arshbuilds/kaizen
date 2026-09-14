"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Target, Plus, Compass, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { GoalSummaryDto } from "@/src/lib/validations/goalSchemas";
import { ApiResponse } from "@/src/types/api";
import { GoalCard } from "@/src/components/Goals/GoalCard";

export default function GoalsPage() {
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");

  const {
    data: goals = [],
    isLoading,
    isError,
    error,
  } = useQuery<GoalSummaryDto[]>({
    queryKey: ["goals", activeTab],
    queryFn: async () => {
      const res = await fetch(`/api/goals?status=${activeTab}`);
      const json: ApiResponse<GoalSummaryDto[]> = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(!json.success ? json.error : "Failed to load goals");
      }
      return json.data;
    },
  });

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 pb-28 pt-6 max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Target className="text-blue-500" size={24} />
            <span>Goals</span>
          </h1>
          <p className="text-xs text-slate-400">
            Define who you want to become & your target roadmap
          </p>
        </div>
        <Link
          href="/goals/new"
          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg shadow-blue-500/20"
          title="Create New Goal"
        >
          <Plus size={20} />
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex rounded-xl bg-slate-900/60 p-1 border border-slate-800 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("active")}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === "active"
              ? "bg-[#1e2235] text-white shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Active Roadmap
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("completed")}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === "completed"
              ? "bg-[#1e2235] text-white shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Completed Archive
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
          <Loader2 size={24} className="animate-spin text-blue-500" />
          <span className="text-xs">Loading goals...</span>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
          {error instanceof Error ? error.message : "Unable to load goals"}
        </div>
      )}

      {/* Goal List */}
      {!isLoading && !isError && goals.length > 0 && (
        <div className="space-y-4">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && goals.length === 0 && (
        <div className="bg-[#1e2235]/80 border border-slate-700/60 rounded-2xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
            <Compass size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white">
              {activeTab === "active"
                ? "No active goals yet"
                : "No completed goals archived yet"}
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {activeTab === "active"
                ? "Set your first major aspirational target and track your checkpoints to achieve it."
                : "When you finish an aspirational target, it will be proudly archived here."}
            </p>
          </div>

          {activeTab === "active" && (
            <div className="pt-2">
              <Link
                href="/goals/new"
                className="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 font-medium text-white shadow-lg shadow-blue-500/25 transition-all text-sm"
              >
                <Plus size={16} />
                <span>Create New Goal</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
