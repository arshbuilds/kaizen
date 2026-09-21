import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/db/mongodb";
import { DailyPlan } from "@/src/lib/db/models/DailyPlan";
import { Action } from "@/src/lib/db/models/Action";
import { MilestoneModel } from "@/src/lib/db/models/Milestone";
import { Goal } from "@/src/lib/db/models/Goal";
import { User } from "@/src/lib/db/models/User";
import {
  DailyPlanDto,
  TodayActionDto,
} from "@/src/lib/validations/dailyPlanSchemas";
import { ApiResponse } from "@/src/types/api";
import mongoose from "mongoose";

/**
 * POST /api/today/generate
 *
 * Generates (or regenerates) a DailyPlan for today using a
 * heuristic cognitive-load-aware scheduling algorithm.
 *
 * Algorithm:
 * ─────────────────────────────────────────────────────────
 * 1. Fetch user preferences:
 *    - dailyTargetMinutes: total available time budget
 *    - focusDurationMinutes: not used directly here yet
 *
 * 2. Pull all "ready" or "scheduled" actions from active goals,
 *    sorted by goal urgency (soonest deadline first).
 *
 * 3. Pack the day using a greedy bin-packing approach:
 *    - Track remaining minutes and deep work session count.
 *    - Prioritize "deep_work" actions first (scheduled while budget allows).
 *    - Then fill remaining capacity with "learning" actions.
 *    - Finally fill any leftover minutes with "shallow_work" actions.
 *    - Each action is added only if it fits within the remaining budget.
 *
 * 4. Persist as a DailyPlan using upsert (replaces any existing plan
 *    for today, allowing the user to regenerate at any time).
 *
 * 5. Returns the full DailyPlanDto.
 */
export async function POST(): Promise<NextResponse<ApiResponse<DailyPlanDto & { hasPlan: true }>>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // 1. Fetch user preferences
    const user = await User.findOne({ clerkId: userId }).lean();
    const dailyTargetMinutes = user?.dailyTargetMinutes ?? 180;
    const timezone = user?.timezone ?? "UTC";

    // Compute today's date in the user's timezone
    const todayDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    // 2. Fetch all active goals to get their IDs and deadlines
    const activeGoals = await Goal.find({ userId, status: "active" })
      .sort({ targetDate: 1 }) // Soonest deadline first
      .lean();

    if (activeGoals.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No active goals found. Create a goal and decompose it first.",
          code: "NO_ACTIVE_GOALS",
        },
        { status: 422 }
      );
    }

    const activeGoalIds = activeGoals.map((g) => g._id);
    const goalMap = new Map(activeGoals.map((g) => [g._id.toString(), g]));

    // 3. Pull all ready/scheduled actions from active goals
    const allCandidates = await Action.find({
      userId,
      goalId: { $in: activeGoalIds },
      status: { $in: ["ready", "scheduled"] },
    })
      .sort({ cognitiveLoad: 1, estimatedMinutes: 1 })
      .lean();

    if (allCandidates.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No ready actions available. All actions may already be completed or your goals have no decomposed roadmap yet.",
          code: "NO_READY_ACTIONS",
        },
        { status: 422 }
      );
    }

    // 4. Cognitive load-aware greedy bin-packing scheduler
    const deepWorkPool = allCandidates.filter((a) => a.cognitiveLoad === "deep_work");
    const learningPool = allCandidates.filter((a) => a.cognitiveLoad === "learning");
    const shallowPool = allCandidates.filter((a) => a.cognitiveLoad === "shallow_work");

    const scheduled: typeof allCandidates = [];
    let remainingMinutes = dailyTargetMinutes;

    // Pack deep work first (most cognitively valuable, limited slots)
    for (const action of deepWorkPool) {
      if (remainingMinutes <= 0) break;
      if (action.estimatedMinutes <= remainingMinutes) {
        scheduled.push(action);
        remainingMinutes -= action.estimatedMinutes;
      }
    }

    // Fill with learning next
    for (const action of learningPool) {
      if (remainingMinutes <= 0) break;
      if (action.estimatedMinutes <= remainingMinutes) {
        scheduled.push(action);
        remainingMinutes -= action.estimatedMinutes;
      }
    }

    // Fill remaining with shallow work
    for (const action of shallowPool) {
      if (remainingMinutes <= 0) break;
      if (action.estimatedMinutes <= remainingMinutes) {
        scheduled.push(action);
        remainingMinutes -= action.estimatedMinutes;
      }
    }

    if (scheduled.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Could not fit any actions within today's time budget.",
          code: "SCHEDULE_EMPTY",
        },
        { status: 422 }
      );
    }

    const scheduledMinutes = scheduled.reduce(
      (sum, a) => sum + a.estimatedMinutes,
      0
    );
    const actionIds = scheduled.map((a) => a._id);

    // 5. Mark the scheduled actions status as "scheduled" in the Action documents
    await Action.updateMany(
      { _id: { $in: actionIds }, userId },
      { $set: { status: "scheduled" } }
    );

    // 6. Upsert the DailyPlan (replace if already exists for today)
    const plan = await DailyPlan.findOneAndUpdate(
      { userId, date: todayDate },
      {
        $set: {
          targetMinutes: dailyTargetMinutes,
          scheduledMinutes,
          completedMinutes: 0,
          actionIds,
          status: "active",
        },
      },
      { upsert: true, new: true }
    );

    // 7. Enrich with milestone and goal breadcrumbs for the response
    const milestoneIds = [...new Set(scheduled.map((a) => a.milestoneId.toString()))];
    const milestones = await MilestoneModel.find({
      _id: { $in: milestoneIds.map((id) => new mongoose.Types.ObjectId(id)) },
    }).lean();
    const milestoneMap = new Map(milestones.map((m) => [m._id.toString(), m]));

    const todayActions: TodayActionDto[] = scheduled.map((action) => {
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
        status: "scheduled",
        order: action.order,
        goalId: action.goalId.toString(),
        goalTitle: goal?.title ?? "Unknown Goal",
        milestoneId: action.milestoneId.toString(),
        milestoneTitle: milestone?.title ?? "Unknown Milestone",
        outcomeId: action.outcomeId.toString(),
        completedAt: action.completedAt?.toISOString(),
      };
    });

    const deepWorkCount = todayActions.filter(
      (a) => a.cognitiveLoad === "deep_work"
    ).length;

    const planDto: DailyPlanDto & { hasPlan: true } = {
      hasPlan: true,
      id: plan._id.toString(),
      userId,
      date: todayDate,
      targetMinutes: dailyTargetMinutes,
      scheduledMinutes,
      completedMinutes: 0,
      status: "active",
      actions: todayActions,
      remainingMinutes: dailyTargetMinutes - scheduledMinutes,
      progressPercentage: 0,
      deepWorkCount,
      completedCount: 0,
      totalCount: todayActions.length,
    };

    return NextResponse.json({
      success: true,
      data: planDto,
      message: `Today's plan generated: ${todayActions.length} actions, ${scheduledMinutes} minutes scheduled`,
    });
  } catch (error) {
    console.error("POST /api/today/generate error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate today's plan",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
