"use client";
import { SkeletonCard } from "@/src/components/ui/Skeleton";

/**
 * loading.tsx — Goals List Page Skeleton
 *
 * Shown while the Goals page fetches the user's goal list.
 * Mirrors the card-list structure.
 */
export default function GoalsLoading() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 pb-28 pt-6 max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-7 w-32 animate-pulse bg-slate-800/70 rounded-lg" />
          <div className="h-3 w-24 animate-pulse bg-slate-800/50 rounded" />
        </div>
        <div className="h-9 w-24 animate-pulse bg-slate-800/60 rounded-xl" />
      </div>

      {/* Goal cards */}
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
