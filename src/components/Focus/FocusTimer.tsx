"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

interface FocusTimerProps {
  /** Total session duration in minutes (e.g. 45) */
  durationMinutes: number;
  /** Called when timer reaches zero (session auto-completes) */
  onComplete: (elapsedMinutes: number) => void;
  /** Called when user manually clicks "Finish Early" */
  onFinishEarly: (elapsedMinutes: number) => void;
}

/**
 * FocusTimer
 *
 * An SVG-based circular countdown timer for the Focus Mode page.
 *
 * How it works:
 * - The timer counts DOWN from `durationMinutes` to 0.
 * - An SVG circle stroke-dashoffset is animated using CSS transitions
 *   to visually represent the remaining time as a shrinking arc.
 * - A ref-based internal clock (`intervalRef`) drives the countdown,
 *   updating state every second.
 * - `elapsedSeconds` is tracked separately (counts up) so we can report
 *   `actualMinutes` accurately when the session ends early.
 *
 * The timer supports:
 * - Play / Pause (preserves elapsed time correctly)
 * - Reset (returns to initial state, does NOT trigger onComplete)
 * - Auto-complete when remaining time reaches 0
 * - Finish Early button — immediately calls `onFinishEarly` with elapsed time
 *
 * Color transitions:
 * - > 50% remaining → blue
 * - 25–50% remaining → amber (caution: session is winding down)
 * - < 25% remaining → orange/red (urgency)
 */
export function FocusTimer({
  durationMinutes,
  onComplete,
  onFinishEarly,
}: FocusTimerProps) {
  const totalSeconds = durationMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasCompleted = useRef(false);

  // SVG circle geometry
  const RADIUS = 110; // radius of the circular track
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // full circle length in px

  // Progress ratio: 0 → full circle, 1 → empty circle (fully elapsed)
  const progressRatio = 1 - secondsLeft / totalSeconds;
  const dashOffset = CIRCUMFERENCE * progressRatio;

  // Color based on remaining time
  const getStrokeColor = () => {
    const ratio = secondsLeft / totalSeconds;
    if (ratio > 0.5) return "#3b82f6"; // blue-500
    if (ratio > 0.25) return "#f59e0b"; // amber-500
    return "#ef4444"; // red-500
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const startTimer = useCallback(() => {
    if (hasCompleted.current) return;
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          hasCompleted.current = true;
          return 0;
        }
        return prev - 1;
      });
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    pauseTimer();
    setSecondsLeft(totalSeconds);
    setElapsedSeconds(0);
    hasCompleted.current = false;
  }, [pauseTimer, totalSeconds]);

  // Auto-complete callback when timer hits zero
  useEffect(() => {
    if (secondsLeft === 0 && hasCompleted.current) {
      onComplete(Math.max(1, Math.round(elapsedSeconds / 60)));
    }
  }, [secondsLeft, elapsedSeconds, onComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const elapsedMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

  return (
    <div className="flex flex-col items-center gap-8">
      {/* SVG Circular Timer */}
      <div className="relative w-64 h-64">
        <svg
          viewBox="0 0 260 260"
          className="w-full h-full -rotate-90"
          aria-label={`Timer: ${formatTime(secondsLeft)} remaining`}
        >
          {/* Background track */}
          <circle
            cx="130"
            cy="130"
            r={RADIUS}
            fill="none"
            stroke="#1e293b"
            strokeWidth="10"
          />
          {/* Progress arc */}
          <circle
            cx="130"
            cy="130"
            r={RADIUS}
            fill="none"
            stroke={getStrokeColor()}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s ease" }}
          />
        </svg>

        {/* Center Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-mono font-bold tracking-widest text-slate-100">
            {formatTime(secondsLeft)}
          </span>
          <span className="text-[11px] text-slate-500 uppercase tracking-wider mt-1">
            {isRunning ? "focusing" : secondsLeft === 0 ? "done!" : "paused"}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Reset */}
        <button
          type="button"
          onClick={resetTimer}
          className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700/60"
          title="Reset timer"
        >
          <RotateCcw size={20} />
        </button>

        {/* Play / Pause */}
        <button
          type="button"
          onClick={isRunning ? pauseTimer : startTimer}
          disabled={secondsLeft === 0}
          className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/30 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          {isRunning ? (
            <>
              <Pause size={22} className="fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play size={22} className="fill-current" />
              <span>{elapsedSeconds > 0 ? "Resume" : "Start"}</span>
            </>
          )}
        </button>
      </div>

      {/* Finish Early button (only visible after timer has started) */}
      {elapsedSeconds > 0 && secondsLeft > 0 && (
        <button
          type="button"
          onClick={() => {
            pauseTimer();
            onFinishEarly(elapsedMinutes);
          }}
          className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-2 transition-colors"
        >
          Finish Early ({elapsedMinutes}m logged)
        </button>
      )}
    </div>
  );
}
