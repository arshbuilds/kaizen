"use client";
import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * error.tsx — Today Page Error Boundary
 *
 * Next.js App Router automatically renders this when an unhandled
 * error is thrown within the Today page or its child components.
 *
 * Provides:
 * - A user-friendly error message (not raw stack traces)
 * - A "Try Again" button that calls `reset()` to re-render the segment
 * - The original error message surfaced as a technical detail
 */
export default function TodayError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Today page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
      <div className="bg-[#1e2235]/80 border border-red-800/40 rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
          <AlertTriangle size={24} className="text-red-400" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-white">Today couldn&apos;t load</h2>
          <p className="text-xs text-slate-400">
            Something went wrong fetching your daily plan.
          </p>
        </div>
        {error.message && (
          <p className="text-[11px] text-slate-600 font-mono bg-slate-900/60 rounded-lg px-3 py-2">
            {error.message}
          </p>
        )}
        <button
          onClick={reset}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    </div>
  );
}
