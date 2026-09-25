/**
 * Skeleton UI Primitives
 *
 * A set of composable skeleton components for showing loading states.
 * All use Tailwind's `animate-pulse` and a layered shimmer effect.
 *
 * Usage:
 *   <SkeletonText lines={3} />           → text block placeholder
 *   <SkeletonCard />                     → a full card-shaped block
 *   <SkeletonStat />                     → a stat box placeholder
 *   <SkeletonActionCard />               → TodayActionCard placeholder
 */

interface SkeletonProps {
  className?: string;
}

export function SkeletonBase({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-800/70 ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({
  lines = 2,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  const widths = ["w-full", "w-5/6", "w-4/6", "w-3/4", "w-2/3"];
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-3 animate-pulse rounded-md bg-slate-800/70 ${
            widths[i % widths.length]
          }`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`bg-[#1e2235]/80 border border-slate-700/60 rounded-2xl p-5 space-y-4 animate-pulse ${className}`}
      aria-hidden="true"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-slate-800/80 rounded-md w-2/3" />
          <div className="h-2.5 bg-slate-800/60 rounded-md w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-2.5 bg-slate-800/60 rounded-md w-full" />
        <div className="h-2.5 bg-slate-800/60 rounded-md w-5/6" />
      </div>
    </div>
  );
}

export function SkeletonStat({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`bg-slate-900/50 rounded-xl p-3.5 border border-slate-800/60 space-y-2 animate-pulse ${className}`}
      aria-hidden="true"
    >
      <div className="h-2.5 bg-slate-800/70 rounded w-16" />
      <div className="h-6 bg-slate-800/80 rounded-md w-12" />
      <div className="h-2 bg-slate-800/60 rounded w-20" />
    </div>
  );
}

export function SkeletonActionCard({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`bg-[#1e2235]/80 border border-l-2 border-slate-700/60 border-l-slate-700 rounded-2xl p-4 space-y-3 animate-pulse ${className}`}
      aria-hidden="true"
    >
      {/* Breadcrumb */}
      <div className="h-2.5 bg-slate-800/60 rounded w-2/3" />
      {/* Title */}
      <div className="h-4 bg-slate-800/80 rounded-md w-5/6" />
      {/* Badges */}
      <div className="flex gap-2">
        <div className="h-5 w-14 bg-slate-800/60 rounded-full" />
        <div className="h-5 w-20 bg-slate-800/60 rounded-full" />
        <div className="h-5 w-12 bg-slate-800/60 rounded-full" />
      </div>
      {/* Button row */}
      <div className="flex gap-2 pt-1">
        <div className="flex-1 h-10 bg-slate-800/70 rounded-xl" />
        <div className="w-10 h-10 bg-slate-800/60 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonProgressBar({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`bg-[#1e2235]/80 border border-slate-700/60 rounded-2xl p-4 space-y-3 animate-pulse ${className}`}
      aria-hidden="true"
    >
      <div className="flex justify-between">
        <div className="h-3 bg-slate-800/60 rounded w-24" />
        <div className="h-3 bg-slate-800/60 rounded w-8" />
      </div>
      <div className="h-2.5 bg-slate-800/80 rounded-full w-full" />
      <div className="flex gap-4">
        <div className="h-2.5 bg-slate-800/50 rounded w-20" />
        <div className="h-2.5 bg-slate-800/50 rounded w-24" />
      </div>
    </div>
  );
}
