"use client";
import React from "react";
import { SkeletonProgressBar, SkeletonActionCard } from "@/src/components/ui/Skeleton";

/**
 * loading.tsx — Today Page Skeleton
 *
 * Next.js automatically renders this file while the Today page
 * is loading. Mirrors the visual structure of the Today page to
 * prevent layout shift and give immediate visual feedback.
 *
 * Structure matches today/page.tsx:
 * 1. Header stub
 * 2. Progress banner skeleton
 * 3. Subtle quote placeholder
 * 4. 3 action card skeletons
 */
export default function TodayLoading() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 pb-28 pt-6 max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-7 w-40 animate-pulse bg-slate-800/70 rounded-lg" />
          <div className="h-3 w-28 animate-pulse bg-slate-800/50 rounded" />
        </div>
        <div className="w-9 h-9 animate-pulse bg-slate-800/70 rounded-full" />
      </div>

      {/* Progress banner */}
      <SkeletonProgressBar />

      {/* Quote placeholder */}
      <div className="h-10 animate-pulse bg-slate-800/30 rounded-xl" />

      {/* Action cards */}
      <div className="space-y-3">
        <div className="h-3 w-24 animate-pulse bg-slate-800/50 rounded" />
        <SkeletonActionCard />
        <SkeletonActionCard />
        <SkeletonActionCard />
      </div>
    </div>
  );
}
