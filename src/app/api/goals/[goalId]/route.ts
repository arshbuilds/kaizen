import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/db/mongodb";
import { Goal } from "@/src/lib/db/models/Goal";
import {
  UpdateGoalSchema,
  GoalDto,
} from "@/src/lib/validations/goalSchemas";
import { ApiResponse } from "@/src/types/api";
import mongoose from "mongoose";

interface RouteContext {
  params: Promise<{ goalId: string }>;
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<GoalDto>>> {
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

    const goal = await Goal.findOne({
      _id: goalId,
      userId,
    }).lean();

    if (!goal) {
      return NextResponse.json(
        { success: false, error: "Goal not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const milestones = goal.milestones || [];
    const completedCount = milestones.filter(
      (m) => m.status === "completed"
    ).length;

    const data: GoalDto = {
      id: goal._id.toString(),
      title: goal.title,
      whyItMatters: goal.whyItMatters,
      status: goal.status,
      targetWeeks: goal.targetWeeks,
      targetDate: goal.targetDate ? goal.targetDate.toISOString() : undefined,
      totalMilestones: milestones.length,
      completedMilestones: completedCount,
      progressPercentage:
        milestones.length > 0
          ? Math.round((completedCount / milestones.length) * 100)
          : 0,
      totalEstimatedMinutes: goal.totalEstimatedMinutes || 0,
      totalCompletedMinutes: goal.totalCompletedMinutes || 0,
      milestones: milestones.map((m) => ({
        id: m._id.toString(),
        title: m.title,
        description: m.description,
        status: m.status,
        order: m.order,
        createdAt: m.createdAt.toISOString(),
      })),
      createdAt: goal.createdAt.toISOString(),
      updatedAt: goal.updatedAt.toISOString(),
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/goals/[goalId] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve goal",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<GoalDto>>> {
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

    const validation = UpdateGoalSchema.safeParse(body);
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

    const updates = validation.data;
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "At least one field must be provided for update",
          code: "NO_UPDATES",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updatePayload: Record<string, unknown> = { ...updates };
    if (updates.targetWeeks) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + updates.targetWeeks * 7);
      updatePayload.targetDate = targetDate;
    }

    const updatedGoal = await Goal.findOneAndUpdate(
      { _id: goalId, userId },
      { $set: updatePayload },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedGoal) {
      return NextResponse.json(
        { success: false, error: "Goal not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const milestones = updatedGoal.milestones || [];
    const completedCount = milestones.filter(
      (m) => m.status === "completed"
    ).length;

    const data: GoalDto = {
      id: updatedGoal._id.toString(),
      title: updatedGoal.title,
      whyItMatters: updatedGoal.whyItMatters,
      status: updatedGoal.status,
      targetWeeks: updatedGoal.targetWeeks,
      targetDate: updatedGoal.targetDate
        ? updatedGoal.targetDate.toISOString()
        : undefined,
      totalMilestones: milestones.length,
      completedMilestones: completedCount,
      progressPercentage:
        milestones.length > 0
          ? Math.round((completedCount / milestones.length) * 100)
          : 0,
      totalEstimatedMinutes: updatedGoal.totalEstimatedMinutes || 0,
      totalCompletedMinutes: updatedGoal.totalCompletedMinutes || 0,
      milestones: milestones.map((m) => ({
        id: m._id.toString(),
        title: m.title,
        description: m.description,
        status: m.status,
        order: m.order,
        createdAt: m.createdAt.toISOString(),
      })),
      createdAt: updatedGoal.createdAt.toISOString(),
      updatedAt: updatedGoal.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data,
      message: "Goal updated successfully",
    });
  } catch (error) {
    console.error("PATCH /api/goals/[goalId] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update goal",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<{ deleted: boolean }>>> {
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

    const result = await Goal.findOneAndDelete({
      _id: goalId,
      userId,
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Goal not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { deleted: true },
      message: "Goal deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/goals/[goalId] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete goal",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
