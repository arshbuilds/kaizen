import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/db/mongodb";
import { Goal } from "@/src/lib/db/models/Goal";
import { Outcome } from "@/src/lib/db/models/Outcome";
import { MilestoneModel } from "@/src/lib/db/models/Milestone";
import { Action } from "@/src/lib/db/models/Action";
import { CommitRoadmapSchema } from "@/src/lib/validations/decompositionSchemas";
import { ApiResponse } from "@/src/types/api";
import mongoose from "mongoose";

interface RouteContext {
  params: Promise<{ goalId: string }>;
}

export interface CommitRoadmapResultDto {
  goalId: string;
  totalOutcomes: number;
  totalMilestones: number;
  totalActions: number;
  totalEstimatedMinutes: number;
}

export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<CommitRoadmapResultDto>>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const { goalId } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(goalId)) {
      return NextResponse.json(
        { success: false, error: "Invalid goal ID format", code: "BAD_REQUEST" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload", code: "BAD_REQUEST" },
        { status: 400 }
      );
    }

    const validation = CommitRoadmapSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0]?.message || "Validation failed",
          code: "VALIDATION_ERROR",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const goal = await Goal.findOne({ _id: goalId, userId });
    if (!goal) {
      return NextResponse.json(
        { success: false, error: "Goal not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const goalObjectId = new mongoose.Types.ObjectId(goalId);

    // Clean up any previously stored roadmap entities for this goal
    await Promise.all([
      Outcome.deleteMany({ goalId: goalObjectId, userId }),
      MilestoneModel.deleteMany({ goalId: goalObjectId, userId }),
      Action.deleteMany({ goalId: goalObjectId, userId }),
    ]);

    let totalActions = 0;
    let totalMilestones = 0;
    let totalEstimatedMinutes = 0;
    const goalSummaryMilestones: Array<{
      _id: mongoose.Types.ObjectId;
      title: string;
      description?: string;
      status: "pending" | "in_progress" | "completed";
      order: number;
      createdAt: Date;
    }> = [];

    // Persist Outcomes -> Milestones -> Actions
    for (const outcomeData of validation.data.outcomes) {
      const outcomeDoc = await Outcome.create({
        goalId: goalObjectId,
        userId,
        title: outcomeData.title,
        description: outcomeData.description,
        order: outcomeData.order,
        status: "pending",
      });

      for (const milestoneData of outcomeData.milestones) {
        const milestoneDoc = await MilestoneModel.create({
          outcomeId: outcomeDoc._id,
          goalId: goalObjectId,
          userId,
          title: milestoneData.title,
          description: milestoneData.description,
          order: milestoneData.order,
          status: "unlocked",
        });

        totalMilestones++;

        goalSummaryMilestones.push({
          _id: milestoneDoc._id,
          title: milestoneDoc.title,
          description: milestoneDoc.description,
          status: "pending",
          order: goalSummaryMilestones.length,
          createdAt: new Date(),
        });

        const actionsToInsert = milestoneData.actions.map((act, actIdx) => {
          totalActions++;
          totalEstimatedMinutes += act.estimatedMinutes;

          return {
            milestoneId: milestoneDoc._id,
            outcomeId: outcomeDoc._id,
            goalId: goalObjectId,
            userId,
            title: act.title,
            description: act.description,
            estimatedMinutes: act.estimatedMinutes,
            actualMinutes: 0,
            difficulty: act.difficulty,
            cognitiveLoad: act.cognitiveLoad,
            status: "ready",
            order: actIdx,
            createdAt: new Date(),
          };
        });

        if (actionsToInsert.length > 0) {
          await Action.insertMany(actionsToInsert);
        }
      }
    }

    // Update parent Goal with total minutes and milestone checkpoints summary
    goal.totalEstimatedMinutes = totalEstimatedMinutes;
    goal.milestones = goalSummaryMilestones as typeof goal.milestones;
    await goal.save();

    const data: CommitRoadmapResultDto = {
      goalId,
      totalOutcomes: validation.data.outcomes.length,
      totalMilestones,
      totalActions,
      totalEstimatedMinutes,
    };

    return NextResponse.json({
      success: true,
      data,
      message: "Roadmap committed and activated successfully",
    });
  } catch (error) {
    console.error("POST /api/goals/[goalId]/commit-roadmap error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to commit roadmap to database",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
