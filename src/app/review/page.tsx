"use client";
import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { RotateCcw, Sparkles, ChevronRight, Loader2, CheckCircle2, History } from "lucide-react";
import { ApiResponse } from "@/src/types/api";
import {
  WeeklyStatsDto,
  WeeklyReviewDto,
  WeeklyReviewSummaryDto,
} from "@/src/lib/validations/reviewSchemas";
import { WeeklyStatsCard } from "@/src/components/Review/WeeklyStatsCard";
import { GoalProgressRow } from "@/src/components/Review/GoalProgressRow";
import { toast } from "sonner";

/**
 * ReviewPage (/review)
 *
 * The adaptive reflection hub. Answers: "How did my week go? What should I
 * change next week?"
 *
 * Structure:
 * 1. Weekly Stats Card — quantitative performance dashboard (from /api/review/stats)
 * 2. Per-Goal Breakdown — which goals got focused time this week
 * 3. Reflection Form — 5-star energy/focus ratings + text fields
 * 4. AI Insight — Gemini-generated coaching note (shown after review submitted)
 * 5. Past Reviews — collapsible history of last 12 weekly reviews
 *
 * Form behaviour:
 * - If a review already exists for this week (hasSubmittedReview = true),
 *   the form pre-fills with existing values and can be updated.
 * - On submit, POST /api/review/submit → returns AI insight and saved review.
 * - AI insight is shown inline below the form after submission.
 *
 * Star rating component (inline, no external dependency):
 * - Clicking a star fills all stars up to and including that one.
 * - Half-star ratings are not supported (coaching clarity over precision).
 */
export default function ReviewPage() {
  // Form state
  const [energyRating, setEnergyRating] = useState(3);
  const [focusRating, setFocusRating] = useState(3);
  const [reflectionNote, setReflectionNote] = useState("");
  const [nextWeekIntention, setNextWeekIntention] = useState("");
  const [submittedReview, setSubmittedReview] = useState<WeeklyReviewDto | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch weekly stats
  const { data: statsResponse, isLoading: statsLoading } = useQuery<
    ApiResponse<WeeklyStatsDto>
  >({
    queryKey: ["review-stats"],
    queryFn: async () => {
      const res = await fetch("/api/review/stats");
      if (!res.ok) throw new Error("Failed to load weekly stats");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  // Fetch review history
  const { data: historyResponse } = useQuery<ApiResponse<WeeklyReviewSummaryDto[]>>({
    queryKey: ["review-history"],
    queryFn: async () => {
      const res = await fetch("/api/review/history");
      if (!res.ok) throw new Error("Failed to load history");
      return res.json();
    },
    staleTime: 1000 * 60 * 10,
    enabled: showHistory,
  });

  // Submit review mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/review/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          energyRating,
          focusRating,
          reflectionNote,
          nextWeekIntention,
        }),
      });
      const json: ApiResponse<WeeklyReviewDto> = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.success === false ? json.error : "Submission failed");
      }
      return json.data;
    },
    onSuccess: (review) => {
      setSubmittedReview(review);
      toast.success("Weekly review saved!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const stats = statsResponse?.success ? statsResponse.data : null;
  const history = historyResponse?.success ? historyResponse.data : [];

  const currentWeekLabel = stats
    ? `Week of ${new Date(stats.weekStart + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} – ${new Date(stats.weekEnd + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`
    : "This Week";

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 pb-28 pt-6 max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <RotateCcw className="text-blue-400" size={22} />
            <span>Weekly Review</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{currentWeekLabel}</p>
        </div>
      </div>

      {/* Weekly Stats */}
      {statsLoading && (
        <div className="flex items-center gap-2 text-slate-400 text-sm py-6 justify-center">
          <Loader2 size={18} className="animate-spin" />
          <span>Loading your week...</span>
        </div>
      )}

      {stats && <WeeklyStatsCard stats={stats} />}

      {/* Goal Breakdown */}
      {stats && stats.goalBreakdown.length > 0 && (
        <div className="bg-[#1e2235]/80 border border-slate-700/60 rounded-2xl p-5 space-y-4 shadow-md">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            By Goal
          </h2>
          <div className="space-y-4">
            {stats.goalBreakdown.map((g) => (
              <GoalProgressRow key={g.goalId} breakdown={g} />
            ))}
          </div>
        </div>
      )}

      {/* Zero-state if no activity */}
      {stats && stats.completedSessionsCount === 0 && (
        <div className="bg-[#1e2235]/80 border border-slate-700/60 rounded-2xl p-5 text-center space-y-2">
          <p className="text-slate-400 text-sm">No focus sessions logged this week yet.</p>
          <p className="text-xs text-slate-500">
            You can still submit a reflection for planning purposes.
          </p>
        </div>
      )}

      {/* Reflection Form */}
      <div className="bg-[#1e2235]/80 border border-slate-700/60 rounded-2xl p-5 space-y-5 shadow-md">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Reflection
        </h2>

        {/* Energy Rating */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">
            How was your energy this week?
          </label>
          <StarRating value={energyRating} onChange={setEnergyRating} />
        </div>

        {/* Focus Rating */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">
            How focused were your sessions?
          </label>
          <StarRating value={focusRating} onChange={setFocusRating} />
        </div>

        {/* Reflection Note */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">
            What happened this week? (wins, blockers, patterns)
          </label>
          <textarea
            value={reflectionNote}
            onChange={(e) => setReflectionNote(e.target.value)}
            placeholder="I made great progress on... The main blocker was... I noticed that..."
            rows={4}
            maxLength={2000}
            className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 resize-none focus:outline-none focus:border-blue-600/60 transition-colors"
          />
          <p className="text-[11px] text-slate-600 text-right">
            {reflectionNote.length}/2000
          </p>
        </div>

        {/* Next Week Intention */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">
            What&apos;s your primary focus for next week?
          </label>
          <input
            type="text"
            value={nextWeekIntention}
            onChange={(e) => setNextWeekIntention(e.target.value)}
            placeholder="One sentence: I will focus on..."
            maxLength={300}
            className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-600/60 transition-colors"
          />
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={() => submitMutation.mutate()}
          disabled={submitMutation.isPending}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
        >
          {submitMutation.isPending ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Generating AI insight...</span>
            </>
          ) : submittedReview ? (
            <>
              <CheckCircle2 size={18} />
              <span>Update Review</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Submit & Get AI Insight</span>
            </>
          )}
        </button>
      </div>

      {/* AI Insight — shown after submission */}
      {submittedReview?.aiInsight && (
        <div className="bg-gradient-to-br from-indigo-900/30 via-blue-900/20 to-slate-900/50 border border-indigo-700/40 rounded-2xl p-5 space-y-3 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <Sparkles size={16} className="text-indigo-400" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              Kaizen AI Insight
            </span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed">
            {submittedReview.aiInsight}
          </p>
          <p className="text-[11px] text-slate-500">
            Based on your {submittedReview.completedSessionsCount} sessions and {submittedReview.totalCompletedMinutes}m of focused work this week.
          </p>
        </div>
      )}

      {/* Review History */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setShowHistory((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-[#1e2235]/60 border border-slate-700/50 rounded-2xl text-sm font-medium text-slate-300 hover:text-white transition-colors"
        >
          <span className="flex items-center gap-2">
            <History size={16} className="text-slate-500" />
            Past Reviews
          </span>
          <ChevronRight
            size={16}
            className={`text-slate-500 transition-transform ${showHistory ? "rotate-90" : ""}`}
          />
        </button>

        {showHistory && (
          <div className="space-y-2">
            {history.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-4">
                No past reviews yet.
              </p>
            )}
            {history.map((review) => {
              const weekLabel = `${new Date(review.weekStart + "T00:00:00").toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric" }
              )} – ${new Date(review.weekEnd + "T00:00:00").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}`;
              return (
                <div
                  key={review.id}
                  className="bg-[#1e2235]/50 border border-slate-700/40 rounded-xl px-4 py-3 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-300">{weekLabel}</span>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>⚡ {review.energyRating}/5</span>
                      <span>🧠 {review.focusRating}/5</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {review.completedSessionsCount} sessions · {review.totalCompletedMinutes}m
                  </p>
                  {review.aiInsight && (
                    <p className="text-[11px] text-indigo-400/80 italic line-clamp-2">
                      {review.aiInsight}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Inline Star Rating Component ───────────────────────────────────────────

interface StarRatingProps {
  value: number;       // 1–5
  onChange: (v: number) => void;
}

/**
 * StarRating
 *
 * A minimal 5-star picker. Each star is a button; clicking it sets the
 * rating to that number. Uses emoji stars for maximum compatibility
 * without any icon library dependency.
 */
function StarRating({ value, onChange }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-2xl transition-transform hover:scale-110 ${
            star <= value ? "opacity-100" : "opacity-25"
          }`}
          aria-label={`Rate ${star} out of 5`}
        >
          ⭐
        </button>
      ))}
      <span className="ml-2 text-xs text-slate-500">{value}/5</span>
    </div>
  );
}
