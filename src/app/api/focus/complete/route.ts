import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/db/mongodb";
import { Action } from "@/src/lib/db/models/Action";
import { MilestoneModel, IMilestoneDocument } from "@/src/lib/db/models/Milestone";
import { Outcome } from "@/src/lib/db/models/Outcome";
import { Goal } from "@/src/lib/db/models/Goal";
import { DailyPlan } from "@/src/lib/db/models/DailyPlan";
import { User } from "@/src/lib/db/models/User";
import {
  CompleteFocusSessionSchema,
  FocusCompleteResultDto,
} from "@/src/lib/validations/dailyPlanSchemas";
import { ApiResponse } from "@/src/types/api";
import mongoose from "mongoose";

/**
 * POST /api/focus/complete
 *
 * Handles the completion of a focus session. This is the most consequential
 * route in Phase 4 — a successful call triggers a cascade of state updates
 * across the entire Kaizen data model:
 *
 * Step 1: Mark the Action as completed
 *   - Sets `status = "completed"`, `actualMinutes`, `completedAt`.
 *
 * Step 2: Update today's DailyPlan
 *   - Increments `completedMinutes` by `actualMinutes`.
 *   - Checks if ALL actions in the plan are now completed; if so,
 *     sets plan `status = "completed"`.
 *
 * Step 3: Check Milestone completion cascade
 *   - Fetches all Action documents under the same Milestone.
 *   - If ALL are completed, marks the Milestone `status = "completed"`.
 *   - Also attempts to unlock the next sequential Milestone under the
 *     same Outcome (sets it to "unlocked" if currently "locked").
 *
 * Step 4: Check Outcome completion cascade
 *   - If ALL Milestones under the parent Outcome are completed,
 *     marks the Outcome `status = "completed"`.
 *
 * Step 5: Update Goal progress statistics
 *   - Recalculates `totalCompletedMinutes` from all completed Actions.
 *   - Updates the embedded milestone summary statuses.
 *
 * Returns:
 *   FocusCompleteResultDto — includes milestone/outcome completion flags
 *   so the frontend can show congratulatory UI without another fetch.
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<FocusCompleteResultDto>>> {
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

    const validation = CompleteFocusSessionSchema.safeParse(body);
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

    const { actionId, actualMinutes } = validation.data;

    if (!mongoose.Types.ObjectId.isValid(actionId)) {
      return NextResponse.json(
        { success: false, error: "Invalid action ID", code: "BAD_REQUEST" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Step 1: Mark Action completed
    const action = await Action.findOne({
      _id: new mongoose.Types.ObjectId(actionId),
      userId,
    });

    if (!action) {
      return NextResponse.json(
        { success: false, error: "Action not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    if (action.status === "completed") {
      return NextResponse.json(
        {
          success: false,
          error: "Action is already completed",
          code: "ALREADY_COMPLETED",
        },
        { status: 409 }
      );
    }

    action.status = "completed";
    action.actualMinutes = actualMinutes;
    action.completedAt = new Date();
    await action.save();

    // Step 2: Update DailyPlan completedMinutes and user streak
    const userDoc = await User.findOne({ clerkId: userId });
    const timezone = userDoc?.timezone ?? "UTC";
    const todayDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    // Calculate streak
    const [yStr, mStr, dStr] = todayDate.split("-");
    const todayUtc = new Date(Date.UTC(Number(yStr), Number(mStr) - 1, Number(dStr)));
    const yesterdayUtc = new Date(todayUtc.getTime() - 86400000);
    const yesterdayDate = yesterdayUtc.toISOString().split("T")[0];

    let currentStreak = userDoc?.currentStreak ?? 0;
    if (userDoc) {
      if (userDoc.lastActiveDate !== todayDate) {
        if (userDoc.lastActiveDate === yesterdayDate) {
          userDoc.currentStreak = (userDoc.currentStreak || 0) + 1;
        } else {
          userDoc.currentStreak = 1;
        }
        userDoc.longestStreak = Math.max(
          userDoc.longestStreak || 0,
          userDoc.currentStreak
        );
        userDoc.lastActiveDate = todayDate;
        await userDoc.save();
      }
      currentStreak = userDoc.currentStreak || 0;
    }

    const plan = await DailyPlan.findOne({ userId, date: todayDate });
    let planCompletedMinutes = 0;
    let planProgressPercentage = 0;

    if (plan) {
      plan.completedMinutes += actualMinutes;

      // Check if all plan actions are completed
      const planActions = await Action.find({
        _id: { $in: plan.actionIds },
        userId,
      }).lean();
      const allPlanDone = planActions.every((a) => a.status === "completed");
      if (allPlanDone) {
        plan.status = "completed";
      }

      await plan.save();
      planCompletedMinutes = plan.completedMinutes;
      planProgressPercentage =
        plan.targetMinutes > 0
          ? Math.min(
              100,
              Math.round((plan.completedMinutes / plan.targetMinutes) * 100)
            )
          : 0;
    }

    // Step 3: Check Milestone completion cascade
    const milestoneId = action.milestoneId;
    const milestoneActions = await Action.find({
      milestoneId,
      userId,
    }).lean();

    const allMilestoneActionsCompleted = milestoneActions.every(
      (a) => a.status === "completed"
    );

    let milestoneCompleted = false;
    let completedMilestone: IMilestoneDocument | null = null;

    if (allMilestoneActionsCompleted) {
      completedMilestone = await MilestoneModel.findByIdAndUpdate(
        milestoneId,
        { $set: { status: "completed" } },
        { new: true }
      );
      milestoneCompleted = true;

      // Unlock next sequential milestone under the same Outcome
      if (completedMilestone) {
        const nextMilestone = await MilestoneModel.findOne({
          outcomeId: completedMilestone.outcomeId,
          userId,
          order: completedMilestone.order + 1,
          status: "locked",
        });
        if (nextMilestone) {
          nextMilestone.status = "unlocked";
          await nextMilestone.save();
        }
      }
    }

    // Step 4: Check Outcome completion cascade
    let outcomeCompleted = false;
    const outcomeId = action.outcomeId;

    const outcomeMilestones = await MilestoneModel.find({
      outcomeId,
      userId,
    }).lean();

    const allOutcomeMilestonesCompleted = outcomeMilestones.every(
      (m) => m.status === "completed"
    );

    if (allOutcomeMilestonesCompleted && outcomeMilestones.length > 0) {
      await Outcome.findByIdAndUpdate(outcomeId, {
        $set: { status: "completed" },
      });
      outcomeCompleted = true;
    }

    // Step 5: Recalculate Goal total completed minutes
    const goalId = action.goalId;
    const allGoalActions = await Action.find({ goalId, userId }).lean();
    const totalCompletedMinutes = allGoalActions
      .filter((a) => a.status === "completed")
      .reduce((sum, a) => sum + (a.actualMinutes || 0), 0);

    const totalMilestones = allGoalActions.length;
    const completedMilestones = allGoalActions.filter(
      (a) => a.status === "completed"
    ).length;

    const progressPercentage =
      totalMilestones > 0
        ? Math.round((completedMilestones / totalMilestones) * 100)
        : 0;

    await Goal.findByIdAndUpdate(goalId, {
      $set: { totalCompletedMinutes },
    });

    const result: FocusCompleteResultDto = {
      actionId,
      actualMinutes,
      milestoneCompleted,
      milestoneId: milestoneId.toString(),
      milestoneTitle: completedMilestone?.title,
      outcomeCompleted,
      goalId: goalId.toString(),
      goalProgressPercentage: progressPercentage,
      planCompletedMinutes,
      planProgressPercentage,
      currentStreak,
    };

    return NextResponse.json({
      success: true,
      data: result,
      message: milestoneCompleted
        ? `🎯 Milestone complete: ${completedMilestone?.title}`
        : "Focus session logged successfully",
    });
  } catch (error) {
    console.error("POST /api/focus/complete error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to complete focus session",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
