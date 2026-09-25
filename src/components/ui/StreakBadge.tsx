/**
 * StreakBadge
 *
 * Displays the user's current consecutive day streak — the number of
 * days in a row they've completed at least one focus session.
 *
 * Visual states:
 * - 0 streak      → muted grey badge (no streak active)
 * - 1–2 days      → warm amber (streak just started)
 * - 3–6 days      → orange (building momentum)
 * - 7+ days       → red/flame (on fire!)
 *
 * The streak integer is passed as a prop (fetched by the Today page
 * from GET /api/streaks). This component is purely presentational.
 */
interface StreakBadgeProps {
  streak: number;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  const { bgClass, textClass, flameOpacity, label } =
    streak === 0
      ? {
          bgClass: "bg-slate-800/60 border-slate-700/50",
          textClass: "text-slate-500",
          flameOpacity: "opacity-30",
          label: "No streak",
        }
      : streak < 3
      ? {
          bgClass: "bg-amber-500/10 border-amber-500/20",
          textClass: "text-amber-300",
          flameOpacity: "opacity-70",
          label: `${streak}d streak`,
        }
      : streak < 7
      ? {
          bgClass: "bg-orange-500/15 border-orange-500/25",
          textClass: "text-orange-300",
          flameOpacity: "opacity-90",
          label: `${streak}d streak`,
        }
      : {
          bgClass: "bg-red-500/15 border-red-500/30",
          textClass: "text-red-300",
          flameOpacity: "opacity-100",
          label: `${streak}d 🔥`,
        };

  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold ${bgClass}`}
      title={`${streak} consecutive day${streak !== 1 ? "s" : ""} with completed sessions`}
    >
      <span className={`text-base leading-none ${flameOpacity}`}>🔥</span>
      <span className={textClass}>{label}</span>
    </div>
  );
}
