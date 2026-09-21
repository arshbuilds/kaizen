import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/db/mongodb";
import { Goal } from "@/src/lib/db/models/Goal";
import { Outcome } from "@/src/lib/db/models/Outcome";
import { MilestoneModel } from "@/src/lib/db/models/Milestone";
import { Action } from "@/src/lib/db/models/Action";
import { FullRoadmapDto } from "@/src/lib/validations/decompositionSchemas";
import { ApiResponse } from "@/src/types/api";
import mongoose from "mongoose";

interface RouteContext {
  params: Promise<{ goalId: string }>;
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<FullRoadmapDto>>> {
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

    await connectToDatabase();

    const goalObjectId = new mongoose.Types.ObjectId(goalId);

    // Verify goal exists and belongs to user
    const goal = await Goal.findOne({ _id: goalObjectId, userId }).lean();
    if (!goal) {
      return NextResponse.json(
        { success: false, error: "Goal not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // Fetch all outcomes, milestones, and actions concurrently
    const [outcomes, milestones, actions] = await Promise.all([
      Outcome.find({ goalId: goalObjectId, userId })
        .sort({ order: 1 })
        .lean(),
      MilestoneModel.find({ goalId: goalObjectId, userId })
        .sort({ order: 1 })
        .lean(),
      Action.find({ goalId: goalObjectId, userId })
        .sort({ order: 1 })
        .lean(),
    ]);

    // Build the hierarchical tree: Outcome -> Milestones -> Actions
    let totalEstimatedMinutes = 0;
    let totalCompletedMinutes = 0;

    const outcomeDtos = outcomes.map((outcome) => {
      const outcomeMilestones = milestones
        .filter((m) => m.outcomeId.toString() === outcome._id.toString())
        .map((milestone) => {
          const milestoneActions = actions
            .filter((a) => a.milestoneId.toString() === milestone._id.toString())
            .map((act) => {
              totalEstimatedMinutes += act.estimatedMinutes;
              if (act.status === "completed") {
                totalCompletedMinutes += act.actualMinutes || act.estimatedMinutes;
              }

              return {
                id: act._id.toString(),
                milestoneId: act.milestoneId.toString(),
                outcomeId: act.outcomeId.toString(),
                goalId: act.goalId.toString(),
                title: act.title,
                description: act.description,
                estimatedMinutes: act.estimatedMinutes,
                actualMinutes: act.actualMinutes,
                difficulty: act.difficulty,
                cognitiveLoad: act.cognitiveLoad,
                status: act.status,
                order: act.order,
                completedAt: act.completedAt?.toISOString(),
              };
            });

          return {
            id: milestone._id.toString(),
            outcomeId: milestone.outcomeId.toString(),
            goalId: milestone.goalId.toString(),
            title: milestone.title,
            description: milestone.description,
            order: milestone.order,
            status: milestone.status,
            actions: milestoneActions,
          };
        });

      return {
        id: outcome._id.toString(),
        goalId: outcome.goalId.toString(),
        title: outcome.title,
        description: outcome.description,
        order: outcome.order,
        status: outcome.status,
        milestones: outcomeMilestones,
      };
    });

    const data: FullRoadmapDto = {
      goalId,
      totalOutcomes: outcomes.length,
      totalMilestones: milestones.length,
      totalActions: actions.length,
      totalEstimatedMinutes,
      totalCompletedMinutes,
      outcomes: outcomeDtos,
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/goals/[goalId]/roadmap error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve goal roadmap hierarchy",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
