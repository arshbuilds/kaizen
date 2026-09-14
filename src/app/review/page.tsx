"use client";
import React from "react";
import Link from "next/link";
import { RotateCcw, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

export default function ReviewPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 pb-28 pt-8 max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <RotateCcw className="text-blue-400" size={24} />
            <span>Daily Review</span>
          </h1>
          <p className="text-sm text-slate-400">
            Reflect on what happened so tomorrow can adapt.
          </p>
        </div>
      </div>

      {/* Review Card Placeholder */}
      <div className="bg-[#1e2235]/90 border border-slate-700/60 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-white">Continuous Feedback Loop</h3>
            <p className="text-xs text-slate-400">
              Kaizen learns your execution speed and energy patterns.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-700/50 pt-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Planned Work Today</span>
            <span className="font-medium text-slate-200">Ready</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Adaptive Adjustments</span>
            <span className="font-medium text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={16} /> Active
            </span>
          </div>
        </div>

        <Link
          href="/today"
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-all"
        >
          <span>View Today&apos;s Execution</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
