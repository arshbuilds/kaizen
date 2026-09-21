import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/db/mongodb";
import { DailyPlan } from "@/src/lib/db/models/DailyPlan";
import { Action } from "@/src/lib/db/models/Action";
import { MilestoneModel } from "@/src/lib/db/models/Milestone";
import { Goal } from "@/src/lib/db/models/Goal";
import { User } from "@/src/lib/db/models/User";
import {
  TodayActionDto,
  DailyPlanDto,
  CandidateActionsDto,
  TodayResponseDto,
} from "@/src/lib/validations/dailyPlanSchemas";
import { ApiResponse } from "@/src/types/api";
import mongoose from "mongoose";

/**
 * GET /api/today
 *
 * Returns the user's execution context for today. Two possible responses:
 *
 * 1. If a DailyPlan already exists for today's date:
 *    Returns the full DailyPlanDto including the ordered action queue,
 *    progress statistics, and enriched goal/milestone breadcrumbs.
 *
 * 2. If no DailyPlan exists yet:
 *    Returns a CandidateActionsDto — a preview of the "ready" actions
 *    across all active goals — so the user can see what's available
 *    before pressing "Generate Today's Plan".
 *
 * Date calculation:
 *   We use the Intl.DateTimeFormat API with the user's stored `timezone`
 *   to calculate the correct "today" date string. This prevents a user
 *   in UTC+5:30 from getting yesterday's date if the server clock is UTC.
 */
export async function GET(): Promise<NextResponse<ApiResponse<TodayResponseDto>>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Fetch user to get their timezone
    const user = await User.findOne({ clerkId: userId }).lean();
    const timezone = user?.timezone || "UTC";

    // Compute today's date in the user's timezone
    const todayDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date()); // en-CA produces "YYYY-MM-DD" format natively

    // Check for an existing plan for today
    const existingPlan = await DailyPlan.findOne({
      userId,
      date: todayDate,
    }).lean();

    if (existingPlan) {
      // Hydrate action queue with full action details
      const actions = await Action.find({
        _id: { $in: existingPlan.actionIds },
        userId,
      })
        .sort({ order: 1 })
        .lean();

      // Fetch parent milestones and goals for breadcrumb data
      const milestoneIds = [...new Set(actions.map((a) => a.milestoneId.toString()))];
      const goalIds = [...new Set(actions.map((a) => a.goalId.toString()))];

      const [milestones, goals] = await Promise.all([
        MilestoneModel.find({
          _id: { $in: milestoneIds.map((id) => new mongoose.Types.ObjectId(id)) },
        }).lean(),
        Goal.find({
          _id: { $in: goalIds.map((id) => new mongoose.Types.ObjectId(id)) },
        }).lean(),
      ]);

      const milestoneMap = new Map(milestones.map((m) => [m._id.toString(), m]));
      const goalMap = new Map(goals.map((g) => [g._id.toString(), g]));

      // Preserve the original queue ordering from actionIds
      const actionIdOrder = existingPlan.actionIds.map((id) => id.toString());
      const sortedActions = [...actions].sort(
        (a, b) =>
          actionIdOrder.indexOf(a._id.toString()) -
          actionIdOrder.indexOf(b._id.toString())
      );

      const todayActions: TodayActionDto[] = sortedActions.map((action) => {
        const milestone = milestoneMap.get(action.milestoneId.toString());
        const goal = goalMap.get(action.goalId.toString());
        return {
          id: action._id.toString(),
          title: action.title,
          description: action.description,
          estimatedMinutes: action.estimatedMinutes,
          actualMinutes: action.actualMinutes,
          cognitiveLoad: action.cognitiveLoad,
          difficulty: action.difficulty,
          status: action.status,
          order: action.order,
          goalId: action.goalId.toString(),
          goalTitle: goal?.title ?? "Unknown Goal",
          milestoneId: action.milestoneId.toString(),
          milestoneTitle: milestone?.title ?? "Unknown Milestone",
          outcomeId: action.outcomeId.toString(),
          completedAt: action.completedAt?.toISOString(),
        };
      });

      const completedCount = todayActions.filter((a) => a.status === "completed").length;
      const deepWorkCount = todayActions.filter(
        (a) => a.cognitiveLoad === "deep_work" && a.status !== "skipped"
      ).length;
      const completedMinutes = existingPlan.completedMinutes;
      const targetMinutes = existingPlan.targetMinutes;

      const planDto: DailyPlanDto & { hasPlan: true } = {
        hasPlan: true,
        id: existingPlan._id.toString(),
        userId,
        date: existingPlan.date,
        targetMinutes,
        scheduledMinutes: existingPlan.scheduledMinutes,
        completedMinutes,
        status: existingPlan.status,
        actions: todayActions,
        remainingMinutes: Math.max(0, targetMinutes - completedMinutes),
        progressPercentage:
          targetMinutes > 0
            ? Math.min(100, Math.round((completedMinutes / targetMinutes) * 100))
            : 0,
        deepWorkCount,
        completedCount,
        totalCount: todayActions.length,
      };

      return NextResponse.json({ success: true, data: planDto });
    }

    const candidateActions = await Action.find({
      userId,
      status: { $in: ["ready", "scheduled"] },
    })
      .sort({ cognitiveLoad: 1, estimatedMinutes: 1 })
      .limit(20)
      .lean();

    const milestoneIds = [...new Set(candidateActions.map((a) => a.milestoneId.toString()))];
    const goalIds = [...new Set(candidateActions.map((a) => a.goalId.toString()))];

    const [milestones, goals] = await Promise.all([
      MilestoneModel.find({
        _id: { $in: milestoneIds.map((id) => new mongoose.Types.ObjectId(id)) },
      }).lean(),
      Goal.find({
        _id: { $in: goalIds.map((id) => new mongoose.Types.ObjectId(id)) },
        status: "active",
      }).lean(),
    ]);

    const milestoneMap = new Map(milestones.map((m) => [m._id.toString(), m]));
    const activeGoalIds = new Set(goals.map((g) => g._id.toString()));
    const goalMap = new Map(goals.map((g) => [g._id.toString(), g]));

    // Only surface actions belonging to active goals
    const activeCandidates = candidateActions
      .filter((a) => activeGoalIds.has(a.goalId.toString()))
      .slice(0, 10);

    const candidateDtos: TodayActionDto[] = activeCandidates.map((action) => {
      const milestone = milestoneMap.get(action.milestoneId.toString());
      const goal = goalMap.get(action.goalId.toString());
      return {
        id: action._id.toString(),
        title: action.title,
        description: action.description,
        estimatedMinutes: action.estimatedMinutes,
        actualMinutes: action.actualMinutes,
        cognitiveLoad: action.cognitiveLoad,
        difficulty: action.difficulty,
        status: action.status,
        order: action.order,
        goalId: action.goalId.toString(),
        goalTitle: goal?.title ?? "Unknown Goal",
        milestoneId: action.milestoneId.toString(),
        milestoneTitle: milestone?.title ?? "Unknown Milestone",
        outcomeId: action.outcomeId.toString(),
        completedAt: action.completedAt?.toISOString(),
      };
    });

    const candidateDto: CandidateActionsDto = {
      hasPlan: false,
      candidateCount: candidateDtos.length,
      candidates: candidateDtos,
    };

    return NextResponse.json({ success: true, data: candidateDto });
  } catch (error) {
    console.error("GET /api/today error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load today's plan",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
