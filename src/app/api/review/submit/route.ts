import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/db/mongodb";
import { WeeklyReview } from "@/src/lib/db/models/WeeklyReview";
import { Action } from "@/src/lib/db/models/Action";
import { DailyPlan } from "@/src/lib/db/models/DailyPlan";
import { Goal } from "@/src/lib/db/models/Goal";
import { User } from "@/src/lib/db/models/User";
import {
  SubmitWeeklyReviewSchema,
  WeeklyReviewDto,
} from "@/src/lib/validations/reviewSchemas";
import { ApiResponse } from "@/src/types/api";
import {
  getGeminiClient,
  GEMINI_DECOMPOSE_MODEL,
} from "@/src/lib/ai/client";
import mongoose from "mongoose";

/**
 * POST /api/review/submit
 *
 * Saves (or updates) the user's weekly review for the current ISO week.
 * Workflow:
 *
 * 1. Validate input: energyRating, focusRating, reflectionNote, nextWeekIntention.
 * 2. Recompute the week's performance stats from live DB data to ensure
 *    the saved review reflects accurate numbers (not client-reported values).
 * 3. Generate a brief AI insight from Gemini based on the user's reflection
 *    note combined with their quantitative performance data.
 * 4. Upsert (create or update) the WeeklyReview document for this week.
 * 5. Return the full WeeklyReviewDto.
 *
 * Idempotent: Calling this multiple times updates the existing review
 * document rather than creating duplicates (upsert on { userId, weekStart }).
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<WeeklyReviewDto>>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload", code: "BAD_REQUEST" },
        { status: 400 }
      );
    }

    const validation = SubmitWeeklyReviewSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0]?.message ?? "Validation failed",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ clerkId: userId }).lean();
    const timezone = user?.timezone ?? "UTC";

    // Compute current ISO week boundaries
    const now = new Date();
    const nowInTz = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
    const dayOfWeek = nowInTz.getDay();
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

    const weekStartUtc = new Date(weekStartDate.toISOString().split("T")[0] + "T00:00:00.000Z");
    const weekEndUtc = new Date(weekEndDate.toISOString().split("T")[0] + "T23:59:59.999Z");

    // Recompute stats from live data
    const completedActions = await Action.find({
      userId,
      status: "completed",
      completedAt: { $gte: weekStartUtc, $lte: weekEndUtc },
    }).lean();

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

    const totalCompletedMinutes = completedActions.reduce(
      (sum, a) => sum + (a.actualMinutes || 0),
      0
    );
    const deepWorkMinutes = completedActions
      .filter((a) => a.cognitiveLoad === "deep_work")
      .reduce((sum, a) => sum + (a.actualMinutes || 0), 0);
    const completedSessionsCount = completedActions.length;
    const totalPlannedMinutes = weeklyPlans.reduce((sum, p) => sum + p.targetMinutes, 0);
    const plannedSessionsCount = weeklyPlans.reduce((sum, p) => sum + p.actionIds.length, 0);

    const uniqueGoalIds = new Set(completedActions.map((a) => a.goalId.toString()));
    const uniqueGoalsTouched = uniqueGoalIds.size;

    // Fetch goal names for AI prompt
    let activeGoalTitles: string[] = [];
    if (uniqueGoalIds.size > 0) {
      const goals = await Goal.find({
        _id: { $in: [...uniqueGoalIds].map((id) => new mongoose.Types.ObjectId(id)) },
        userId,
      }).lean();
      activeGoalTitles = goals.map((g) => g.title);
    }

    // Generate AI insight
    let aiInsight: string | undefined;
    try {
      const ai = getGeminiClient();
      const { energyRating, focusRating, reflectionNote, nextWeekIntention } = validation.data;

      const insightPrompt = `You are Kaizen's adaptive coaching system. Generate a concise, empathetic, and actionable insight (2-3 sentences max) for a user based on their weekly review.

Weekly Data:
- Sessions completed: ${completedSessionsCount} of ${plannedSessionsCount} planned
- Minutes of focused work: ${totalCompletedMinutes}m total, ${deepWorkMinutes}m deep work
- Goals worked on: ${activeGoalTitles.join(", ") || "None"}
- Energy rating: ${energyRating}/5
- Focus rating: ${focusRating}/5
- Reflection: "${reflectionNote || "No reflection note provided."}"
- Next week intention: "${nextWeekIntention || "Not specified."}"

Write a warm, specific, and forward-looking insight that acknowledges their actual performance (not generic encouragement), identifies one pattern, and gives one concrete micro-adjustment for next week.`;

      const response = await ai.models.generateContent({
        model: GEMINI_DECOMPOSE_MODEL,
        contents: insightPrompt,
        config: {
          maxOutputTokens: 200,
          temperature: 0.7,
        },
      });
      aiInsight = response.text?.trim() ?? undefined;
    } catch (aiErr) {
      console.warn("AI insight generation failed (non-fatal):", aiErr);
      // AI failure is non-fatal — we still save the review without it
    }

    // Upsert the weekly review
    const review = await WeeklyReview.findOneAndUpdate(
      { userId, weekStart },
      {
        $set: {
          totalCompletedMinutes,
          totalPlannedMinutes,
          completedSessionsCount,
          plannedSessionsCount,
          deepWorkMinutes,
          uniqueGoalsTouched,
          energyRating: validation.data.energyRating,
          focusRating: validation.data.focusRating,
          reflectionNote: validation.data.reflectionNote,
          nextWeekIntention: validation.data.nextWeekIntention,
          ...(aiInsight ? { aiInsight } : {}),
        },
      },
      { upsert: true, new: true }
    );

    const dto: WeeklyReviewDto = {
      id: review._id.toString(),
      weekStart,
      weekEnd,
      totalCompletedMinutes,
      totalPlannedMinutes,
      completedSessionsCount,
      plannedSessionsCount,
      deepWorkMinutes,
      uniqueGoalsTouched,
      energyRating: review.energyRating,
      focusRating: review.focusRating,
      reflectionNote: review.reflectionNote,
      nextWeekIntention: review.nextWeekIntention,
      aiInsight: review.aiInsight,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: dto,
      message: "Weekly review saved successfully",
    });
  } catch (error) {
    console.error("POST /api/review/submit error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save weekly review", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
