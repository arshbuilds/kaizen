import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/db/mongodb";
import { Action } from "@/src/lib/db/models/Action";
import { DailyPlan } from "@/src/lib/db/models/DailyPlan";
import { UpdateActionStatusSchema } from "@/src/lib/validations/dailyPlanSchemas";
import { ApiResponse } from "@/src/types/api";
import mongoose from "mongoose";

interface RouteContext {
  params: Promise<{ actionId: string }>;
}

/**
 * PATCH /api/actions/[actionId]
 *
 * Updates the status of a specific action.
 * Used by the Today page to skip, defer, or reschedule individual actions.
 *
 * Authenticated users can only update their own actions (strict userId check).
 * When an action is skipped, it is removed from the day's actionIds array
 * so it no longer appears in today's queue.
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<{ id: string; status: string }>>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const { actionId } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(actionId)) {
      return NextResponse.json(
        { success: false, error: "Invalid action ID", code: "BAD_REQUEST" },
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

    const validation = UpdateActionStatusSchema.safeParse(body);
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

    if (validation.data.status) {
      action.status = validation.data.status;
    }

    await action.save();

    // If the action is being skipped or abandoned, remove it from today's plan
    if (
      validation.data.status === "skipped" ||
      validation.data.status === "abandoned"
    ) {
      await DailyPlan.updateMany(
        { userId, actionIds: action._id },
        { $pull: { actionIds: action._id } }
      );
    }

    return NextResponse.json({
      success: true,
      data: { id: action._id.toString(), status: action.status },
      message: "Action updated",
    });
  } catch (error) {
    console.error("PATCH /api/actions/[actionId] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update action",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
