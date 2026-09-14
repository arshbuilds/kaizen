"use client";
import React from "react";
import Link from "next/link";
import { Play, ArrowLeft } from "lucide-react";

export default function FocusPage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col items-center justify-between p-6">
      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-between pt-4">
        <Link
          href="/today"
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
          Focus Mode
        </span>
        <div className="w-9" />
      </div>

      {/* Main Focus Display */}
      <div className="w-full max-w-md flex flex-col items-center text-center my-auto space-y-8">
        <div className="space-y-2">
          <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-blue-900/50 text-blue-300 border border-blue-700/50">
            Current Action
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
            Ready to Begin Execution
          </h1>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">
            Select an action from Today&apos;s Plan to launch your focused work session.
          </p>
        </div>

        {/* Timer Placeholder */}
        <div className="relative w-64 h-64 rounded-full border-4 border-slate-800 flex items-center justify-center bg-slate-900/40 shadow-2xl">
          <div className="text-5xl font-mono font-bold tracking-wider text-slate-200">
            00:00
          </div>
        </div>

        {/* Controls */}
        <Link
          href="/today"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
        >
          <Play size={20} className="fill-current" />
          <span>Go to Today&apos;s Plan</span>
        </Link>
      </div>

      <div className="pb-6 text-xs text-slate-500 text-center">
        Distraction-free environment • Telemetry active
      </div>
    </div>
  );
}
