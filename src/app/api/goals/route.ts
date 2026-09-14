import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/db/mongodb";
import { Goal, GoalStatus } from "@/src/lib/db/models/Goal";
import {
  CreateGoalSchema,
  GoalDto,
  GoalSummaryDto,
} from "@/src/lib/validations/goalSchemas";
import { ApiResponse } from "@/src/types/api";

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<GoalSummaryDto[]>>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const searchParams = request.nextUrl.searchParams;
    const statusParam = searchParams.get("status");

    // Filter query: default to excluding archived goals unless requested
    const filter: {
      userId: string;
      status?: GoalStatus | { $ne: GoalStatus };
    } = {
      userId,
    };

    if (statusParam && statusParam !== "all") {
      filter.status = statusParam as GoalStatus;
    } else if (!statusParam) {
      // Default: show active and paused (exclude archived)
      filter.status = { $ne: "archived" };
    }

    const goals = await Goal.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const data: GoalSummaryDto[] = goals.map((g) => {
      const milestones = g.milestones || [];
      const totalMilestones = milestones.length;
      const completedMilestones = milestones.filter(
        (m) => m.status === "completed"
      ).length;
      const progressPercentage =
        totalMilestones > 0
          ? Math.round((completedMilestones / totalMilestones) * 100)
          : 0;

      return {
        id: g._id.toString(),
        title: g.title,
        whyItMatters: g.whyItMatters,
        status: g.status,
        targetWeeks: g.targetWeeks,
        targetDate: g.targetDate ? g.targetDate.toISOString() : undefined,
        totalMilestones,
        completedMilestones,
        progressPercentage,
        createdAt: g.createdAt.toISOString(),
        updatedAt: g.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/goals error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch goals",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<GoalDto>>> {
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

    const validation = CreateGoalSchema.safeParse(body);
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

    const { title, whyItMatters, targetWeeks, milestones } = validation.data;

    // Calculate estimated target date based on weeks from now
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + targetWeeks * 7);

    const newGoal = await Goal.create({
      userId,
      title,
      whyItMatters,
      targetWeeks,
      targetDate,
      status: "active",
      milestones: (milestones || []).map((m, idx) => ({
        ...m,
        order: m.order ?? idx,
        createdAt: new Date(),
      })),
    });

    const populatedMilestones = newGoal.milestones || [];
    const completedCount = populatedMilestones.filter(
      (m) => m.status === "completed"
    ).length;

    const data: GoalDto = {
      id: newGoal._id.toString(),
      title: newGoal.title,
      whyItMatters: newGoal.whyItMatters,
      status: newGoal.status,
      targetWeeks: newGoal.targetWeeks,
      targetDate: newGoal.targetDate ? newGoal.targetDate.toISOString() : undefined,
      totalMilestones: populatedMilestones.length,
      completedMilestones: completedCount,
      progressPercentage:
        populatedMilestones.length > 0
          ? Math.round((completedCount / populatedMilestones.length) * 100)
          : 0,
      totalEstimatedMinutes: newGoal.totalEstimatedMinutes || 0,
      totalCompletedMinutes: newGoal.totalCompletedMinutes || 0,
      milestones: populatedMilestones.map((m) => ({
        id: m._id.toString(),
        title: m.title,
        description: m.description,
        status: m.status,
        order: m.order,
        createdAt: m.createdAt.toISOString(),
      })),
      createdAt: newGoal.createdAt.toISOString(),
      updatedAt: newGoal.updatedAt.toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data,
        message: "Goal created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/goals error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create goal",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
