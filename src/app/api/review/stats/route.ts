import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/db/mongodb";
import { Action } from "@/src/lib/db/models/Action";
import { DailyPlan } from "@/src/lib/db/models/DailyPlan";
import { Goal } from "@/src/lib/db/models/Goal";
import { WeeklyReview } from "@/src/lib/db/models/WeeklyReview";
import { User } from "@/src/lib/db/models/User";
import { WeeklyStatsDto, GoalWeeklyBreakdown } from "@/src/lib/validations/reviewSchemas";
import { ApiResponse } from "@/src/types/api";
import mongoose from "mongoose";

/**
 * GET /api/review/stats
 *
 * Computes the user's performance statistics for the current ISO week
 * (Monday through Sunday). Returns rich data to power the Review dashboard:
 *
 * 1. Aggregate minutes/session counts from completed Actions whose
 *    `completedAt` falls within [weekStart, weekEnd].
 * 2. Aggregate planned minutes/session counts from DailyPlans within the week.
 * 3. Per-day minute breakdown (for the 7-day bar chart on the review page).
 * 4. Per-goal breakdown: which goals were worked on and how much.
 * 5. Whether the user has already submitted a review for this week.
 *
 * Date calculation:
 *   ISO week starts on Monday. We derive the Monday of the current week
 *   using the user's stored timezone, then compute all 7 days.
 */
export async function GET(): Promise<NextResponse<ApiResponse<WeeklyStatsDto>>> {
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

    // Compute the Monday of the current ISO week in the user's timezone
    const now = new Date();
    const nowInTz = new Date(
      now.toLocaleString("en-US", { timeZone: timezone })
    );
    const dayOfWeek = nowInTz.getDay(); // 0 = Sunday, 1 = Monday, ...
    // Days since last Monday (ISO: week starts Monday)
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const weekStartDate = new Date(nowInTz);
    weekStartDate.setDate(nowInTz.getDate() - daysSinceMonday);
    weekStartDate.setHours(0, 0, 0, 0);

    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);
    weekEndDate.setHours(23, 59, 59, 999);

    const formatDate = (d: Date): string => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    const weekStart = formatDate(weekStartDate);
    const weekEnd = formatDate(weekEndDate);

    // Build date range as UTC boundaries for MongoDB queries
    // We need the start of weekStart day in UTC and end of weekEnd day in UTC
    const weekStartUtc = new Date(weekStartDate.toISOString().split("T")[0] + "T00:00:00.000Z");
    const weekEndUtc = new Date(weekEndDate.toISOString().split("T")[0] + "T23:59:59.999Z");

    // 1. Fetch all completed actions within the week
    const completedActions = await Action.find({
      userId,
      status: "completed",
      completedAt: { $gte: weekStartUtc, $lte: weekEndUtc },
    }).lean();

    // 2. Fetch all DailyPlans within the week (by date string range)
    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStartDate);
      d.setDate(weekStartDate.getDate() + i);
      weekDates.push(formatDate(d));
    }

    const weeklyPlans = await DailyPlan.find({
      userId,
      date: { $in: weekDates },
    }).lean();

    // 3. Compute aggregates
    const totalCompletedMinutes = completedActions.reduce(
      (sum, a) => sum + (a.actualMinutes || 0),
      0
    );
    const deepWorkMinutes = completedActions
      .filter((a) => a.cognitiveLoad === "deep_work")
      .reduce((sum, a) => sum + (a.actualMinutes || 0), 0);

    const completedSessionsCount = completedActions.length;

    const totalPlannedMinutes = weeklyPlans.reduce(
      (sum, p) => sum + p.targetMinutes,
      0
    );
    const plannedSessionsCount = weeklyPlans.reduce(
      (sum, p) => sum + p.actionIds.length,
      0
    );

    const uniqueGoalIds = new Set(
      completedActions.map((a) => a.goalId.toString())
    );
    const uniqueGoalsTouched = uniqueGoalIds.size;

    const minuteCompletionRate =
      totalPlannedMinutes > 0
        ? Math.min(100, Math.round((totalCompletedMinutes / totalPlannedMinutes) * 100))
        : 0;
    const sessionCompletionRate =
      plannedSessionsCount > 0
        ? Math.min(100, Math.round((completedSessionsCount / plannedSessionsCount) * 100))
        : 0;

    // 4. Per-day breakdown
    const dailyMinutesMap = new Map<string, number>();
    for (const dateStr of weekDates) {
      dailyMinutesMap.set(dateStr, 0);
    }
    for (const action of completedActions) {
      if (action.completedAt) {
        const d = new Date(action.completedAt);
        const dateStr = formatDate(d);
        if (dailyMinutesMap.has(dateStr)) {
          dailyMinutesMap.set(
            dateStr,
            (dailyMinutesMap.get(dateStr) ?? 0) + (action.actualMinutes || 0)
          );
        }
      }
    }
    const dailyMinutes = weekDates.map((date) => ({
      date,
      minutes: dailyMinutesMap.get(date) ?? 0,
    }));

    // 5. Per-goal breakdown
    const goalBreakdown: GoalWeeklyBreakdown[] = [];
    if (uniqueGoalIds.size > 0) {
      const goals = await Goal.find({
        _id: {
          $in: [...uniqueGoalIds].map((id) => new mongoose.Types.ObjectId(id)),
        },
        userId,
      }).lean();

      const goalMap = new Map(goals.map((g) => [g._id.toString(), g]));

      // Also get planned actions per goal from the week
      const allWeekActionIds = weeklyPlans.flatMap((p) => p.actionIds);
      const allWeekActions = await Action.find({
        _id: { $in: allWeekActionIds },
        userId,
      }).lean();

      for (const goalId of uniqueGoalIds) {
        const goal = goalMap.get(goalId);
        if (!goal) continue;

        const goalCompleted = completedActions.filter(
          (a) => a.goalId.toString() === goalId
        );
        const goalPlanned = allWeekActions.filter(
          (a) => a.goalId.toString() === goalId
        );

        const completedMins = goalCompleted.reduce(
          (sum, a) => sum + (a.actualMinutes || 0),
          0
        );
        const totalSessions = Math.max(goalCompleted.length, goalPlanned.length);

        goalBreakdown.push({
          goalId,
          goalTitle: goal.title,
          completedMinutes: completedMins,
          completedSessions: goalCompleted.length,
          totalSessions,
          completionRate:
            totalSessions > 0
              ? Math.round((goalCompleted.length / totalSessions) * 100)
              : 0,
        });
      }

      goalBreakdown.sort((a, b) => b.completedMinutes - a.completedMinutes);
    }

    // 6. Check if review already submitted this week
    const existingReview = await WeeklyReview.findOne({
      userId,
      weekStart,
    }).lean();

    const data: WeeklyStatsDto = {
      weekStart,
      weekEnd,
      totalCompletedMinutes,
      totalPlannedMinutes,
      completedSessionsCount,
      plannedSessionsCount,
      deepWorkMinutes,
      uniqueGoalsTouched,
      minuteCompletionRate,
      sessionCompletionRate,
      dailyMinutes,
      goalBreakdown,
      hasSubmittedReview: !!existingReview,
      existingReviewId: existingReview?._id.toString(),
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/review/stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load weekly stats", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
