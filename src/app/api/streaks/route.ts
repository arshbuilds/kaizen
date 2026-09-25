import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/db/mongodb";
import { DailyPlan } from "@/src/lib/db/models/DailyPlan";
import { Action } from "@/src/lib/db/models/Action";
import { User } from "@/src/lib/db/models/User";
import { ApiResponse } from "@/src/types/api";

export interface StreakDto {
  currentStreak: number;   // Consecutive days with ≥1 completed session
  longestStreak: number;   // All-time best streak
  lastActiveDate: string | null; // "YYYY-MM-DD" of last session
  isActiveToday: boolean;  // Did the user complete a session today?
}

/**
 * GET /api/streaks
 *
 * Computes the user's current consecutive day streak by walking backwards
 * through DailyPlan documents looking for days with at least one
 * completed Action (completedMinutes > 0).
 *
 * Algorithm:
 * 1. Fetch the last 90 DailyPlan docs (max 3 months window) sorted
 *    by date descending.
 * 2. For each plan, check if `completedMinutes > 0` (at least one session done).
 * 3. Walk the date sequence: if a plan for the previous calendar day exists
 *    and has completed minutes, increment streak. Break when a gap is found.
 * 4. The longest streak is computed across all plans in the window.
 *
 * The streak counts a day as "active" if the user completed at least
 * one focus session (completedMinutes > 0), not if they merely generated
 * a plan. This prevents gaming by just opening the app.
 */
export async function GET(): Promise<NextResponse<ApiResponse<StreakDto>>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ clerkId: userId }).lean();
    const timezone = user?.timezone ?? "UTC";

    // Compute today's date in user's timezone
    const todayDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    // Fetch last 90 plans sorted desc
    const plans = await DailyPlan.find({ userId })
      .sort({ date: -1 })
      .limit(90)
      .lean();

    // Build a map of date → hasCompletedSession
    const activeDays = new Set<string>();
    for (const plan of plans) {
      if (plan.completedMinutes > 0) {
        activeDays.add(plan.date);
      }
    }

    // Also check if there are completed actions today even without a plan
    // (edge case: user completes a session on a day where plan wasn't generated)
    const todayUtcStart = new Date(todayDate + "T00:00:00.000Z");
    const todayUtcEnd = new Date(todayDate + "T23:59:59.999Z");
    const todayCompletedCount = await Action.countDocuments({
      userId,
      status: "completed",
      completedAt: { $gte: todayUtcStart, $lte: todayUtcEnd },
    });
    if (todayCompletedCount > 0) {
      activeDays.add(todayDate);
    }

    const isActiveToday = activeDays.has(todayDate);

    // Helper: get YYYY-MM-DD string for N days before a given date string
    const subtractDay = (dateStr: string, n: number): string => {
      const d = new Date(dateStr + "T12:00:00.000Z");
      d.setUTCDate(d.getUTCDate() - n);
      return d.toISOString().split("T")[0];
    };

    // Compute current streak: walk backwards from today (or yesterday if not active today)
    let currentStreak = 0;
    let checkDate = todayDate;

    // If active today, start counting from today. Otherwise start from yesterday.
    if (activeDays.has(checkDate)) {
      currentStreak = 1;
      checkDate = subtractDay(checkDate, 1);
      while (activeDays.has(checkDate)) {
        currentStreak++;
        checkDate = subtractDay(checkDate, 1);
      }
    } else {
      // Not active today — check if streak was active yesterday (grace: streak not yet broken today)
      checkDate = subtractDay(todayDate, 1);
      if (activeDays.has(checkDate)) {
        currentStreak = 1;
        checkDate = subtractDay(checkDate, 1);
        while (activeDays.has(checkDate)) {
          currentStreak++;
          checkDate = subtractDay(checkDate, 1);
        }
      }
    }

    // Compute longest streak across the full 90-day window
    let longestStreak = 0;
    let runningStreak = 0;
    let lastActiveDate: string | null = null;

    // Sort all active days descending
    const sortedActiveDays = [...activeDays].sort().reverse();
    if (sortedActiveDays.length > 0) {
      lastActiveDate = sortedActiveDays[0];
    }

    // Walk ascending for longest streak
    const ascendingActive = [...activeDays].sort();
    for (let i = 0; i < ascendingActive.length; i++) {
      if (i === 0) {
        runningStreak = 1;
      } else {
        const prev = ascendingActive[i - 1];
        const curr = ascendingActive[i];
        const expectedPrev = subtractDay(curr, 1);
        if (prev === expectedPrev) {
          runningStreak++;
        } else {
          runningStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, runningStreak);
    }

    longestStreak = Math.max(longestStreak, currentStreak);

    return NextResponse.json({
      success: true,
      data: {
        currentStreak,
        longestStreak,
        lastActiveDate,
        isActiveToday,
      },
    });
  } catch (error) {
    console.error("GET /api/streaks error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to compute streak", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
