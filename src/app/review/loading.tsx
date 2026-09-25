"use client";
import { SkeletonCard, SkeletonStat } from "@/src/components/ui/Skeleton";

/**
 * loading.tsx — Review Page Skeleton
 *
 * Shown while the Review page fetches weekly stats.
 * Mirrors the page structure: header → stats card (2×2 grid) → form stub.
 */
export default function ReviewLoading() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 pb-28 pt-6 max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="h-7 w-44 animate-pulse bg-slate-800/70 rounded-lg" />
        <div className="h-3 w-32 animate-pulse bg-slate-800/50 rounded" />
      </div>

      {/* Stats Card */}
      <div className="bg-[#1e2235]/80 border border-slate-700/60 rounded-2xl p-5 space-y-4 animate-pulse">
        <div className="h-3 w-36 bg-slate-800/60 rounded" />
        <div className="grid grid-cols-2 gap-3">
          <SkeletonStat />
          <SkeletonStat />
          <SkeletonStat />
          <SkeletonStat />
        </div>
        {/* Bar chart placeholder */}
        <div className="space-y-2">
          <div className="h-2.5 w-28 bg-slate-800/50 rounded" />
          <div className="flex items-end gap-1.5 h-16">
            {[60, 80, 45, 100, 70, 30, 55].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-slate-800/70 rounded-t-sm"
                  style={{ height: `${h}%` }}
                />
                <div className="h-2 w-3 bg-slate-800/50 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reflection form skeleton */}
      <SkeletonCard />
    </div>
  );
}
