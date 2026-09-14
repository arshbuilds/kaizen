import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/db/mongodb";
import { Goal } from "@/src/lib/db/models/Goal";
import {
  AddMilestoneSchema,
  MilestoneDto,
} from "@/src/lib/validations/goalSchemas";
import { ApiResponse } from "@/src/types/api";
import mongoose from "mongoose";

interface RouteContext {
  params: Promise<{ goalId: string }>;
}

export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<MilestoneDto>>> {
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

    const validation = AddMilestoneSchema.safeParse(body);
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

    const newMilestoneId = new mongoose.Types.ObjectId();
    const order = goal.milestones.length;

    const newMilestone = {
      _id: newMilestoneId,
      title: validation.data.title,
      description: validation.data.description,
      status: "pending" as const,
      order,
      createdAt: new Date(),
    };

    goal.milestones.push(newMilestone);
    await goal.save();

    const data: MilestoneDto = {
      id: newMilestoneId.toString(),
      title: newMilestone.title,
      description: newMilestone.description,
      status: newMilestone.status,
      order: newMilestone.order,
      createdAt: newMilestone.createdAt.toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data,
        message: "Milestone added successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/goals/[goalId]/milestones error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add milestone",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
