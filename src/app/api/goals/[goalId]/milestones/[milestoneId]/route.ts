import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/db/mongodb";
import { Goal } from "@/src/lib/db/models/Goal";
import {
  UpdateMilestoneSchema,
  MilestoneDto,
} from "@/src/lib/validations/goalSchemas";
import { ApiResponse } from "@/src/types/api";
import mongoose from "mongoose";

interface RouteContext {
  params: Promise<{ goalId: string; milestoneId: string }>;
}

export async function PATCH(
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

    const { goalId, milestoneId } = await context.params;
    if (
      !mongoose.Types.ObjectId.isValid(goalId) ||
      !mongoose.Types.ObjectId.isValid(milestoneId)
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid ID format", code: "BAD_REQUEST" },
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

    const validation = UpdateMilestoneSchema.safeParse(body);
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

    const updates = validation.data;
    const updateFields: Record<string, unknown> = {};

    if (updates.title !== undefined) {
      updateFields["milestones.$.title"] = updates.title;
    }
    if (updates.description !== undefined) {
      updateFields["milestones.$.description"] = updates.description;
    }
    if (updates.status !== undefined) {
      updateFields["milestones.$.status"] = updates.status;
    }
    if (updates.order !== undefined) {
      updateFields["milestones.$.order"] = updates.order;
    }

    const milestoneObjId = new mongoose.Types.ObjectId(milestoneId);

    const updatedGoal = await Goal.findOneAndUpdate(
      {
        _id: goalId,
        userId,
        "milestones._id": milestoneObjId,
      },
      { $set: updateFields },
      { new: true }
    ).lean();

    if (!updatedGoal) {
      return NextResponse.json(
        {
          success: false,
          error: "Goal or milestone not found",
          code: "NOT_FOUND",
        },
        { status: 404 }
      );
    }

    const updatedMilestone = updatedGoal.milestones.find(
      (m) => m._id.toString() === milestoneId
    );

    if (!updatedMilestone) {
      return NextResponse.json(
        { success: false, error: "Milestone not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const data: MilestoneDto = {
      id: updatedMilestone._id.toString(),
      title: updatedMilestone.title,
      description: updatedMilestone.description,
      status: updatedMilestone.status,
      order: updatedMilestone.order,
      createdAt: updatedMilestone.createdAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data,
      message: "Milestone updated successfully",
    });
  } catch (error) {
    console.error("PATCH milestone error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update milestone",
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

    const { goalId, milestoneId } = await context.params;
    if (
      !mongoose.Types.ObjectId.isValid(goalId) ||
      !mongoose.Types.ObjectId.isValid(milestoneId)
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid ID format", code: "BAD_REQUEST" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const milestoneObjId = new mongoose.Types.ObjectId(milestoneId);

    const result = await Goal.findOneAndUpdate(
      { _id: goalId, userId },
      { $pull: { milestones: { _id: milestoneObjId } } },
      { new: true }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Goal not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { deleted: true },
      message: "Milestone removed successfully",
    });
  } catch (error) {
    console.error("DELETE milestone error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete milestone",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
