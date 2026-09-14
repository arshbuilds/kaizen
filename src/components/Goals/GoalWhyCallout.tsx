import React from "react";
import clsx from "clsx";

interface GoalWhyCalloutProps {
  whyItMatters: string;
  className?: string;
}

/**
 * GoalWhyCallout renders the user's intrinsic emotional driver
 * with a subtle left-accent border and calm, unopinionated typography.
 */
export function GoalWhyCallout({
  whyItMatters,
  className,
}: GoalWhyCalloutProps) {
  if (!whyItMatters) return null;

  return (
    <div
      className={clsx(
        "border-l-2 border-indigo-500/60 bg-indigo-950/20 rounded-r-xl px-4 py-3 text-slate-300",
        className
      )}
    >
      <span className="block text-[11px] font-semibold uppercase tracking-wider text-indigo-400/90 mb-1">
        Why This Matters
      </span>
      <p className="text-sm italic leading-relaxed text-slate-200">
        &ldquo;{whyItMatters}&rdquo;
      </p>
    </div>
  );
}
