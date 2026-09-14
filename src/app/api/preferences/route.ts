import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/db/mongodb";
import { User } from "@/src/lib/db/models/User";
import {
  UpdatePreferencesSchema,
  UserPreferencesDto,
} from "@/src/lib/validations/userSchemas";
import { ApiResponse } from "@/src/types/api";

export async function GET(): Promise<NextResponse<ApiResponse<UserPreferencesDto>>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    let user = await User.findOne({ clerkId: userId }).lean();

    // Auto-sync if user authenticated via Clerk but doesn't have a MongoDB document yet
    if (!user) {
      const clerkUser = await currentUser();
      if (!clerkUser) {
        return NextResponse.json(
          { success: false, error: "User session not found", code: "NOT_FOUND" },
          { status: 404 }
        );
      }

      const primaryEmail =
        clerkUser.emailAddresses.find(
          (e) => e.id === clerkUser.primaryEmailAddressId
        )?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress;

      const fullName =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
        clerkUser.username ||
        "Kaizen User";

      user = await User.findOneAndUpdate(
        { clerkId: userId },
        {
          $set: {
            email: primaryEmail || "unknown@kaizen.local",
            name: fullName,
            imageUrl: clerkUser.imageUrl,
          },
          $setOnInsert: {
            clerkId: userId,
            timezone: "UTC",
            dailyTargetMinutes: 180,
            focusDurationMinutes: 45,
            preferredWorkBlocks: ["morning", "afternoon"],
          },
        },
        { upsert: true, new: true }
      ).lean();
    }

    const data: UserPreferencesDto = {
      clerkId: user!.clerkId,
      email: user!.email,
      name: user!.name,
      timezone: user!.timezone || "UTC",
      dailyTargetMinutes: user!.dailyTargetMinutes ?? 180,
      focusDurationMinutes: user!.focusDurationMinutes ?? 45,
      preferredWorkBlocks: user!.preferredWorkBlocks ?? ["morning", "afternoon"],
      updatedAt: user!.updatedAt || new Date(),
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/preferences error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve planning preferences",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest
): Promise<NextResponse<ApiResponse<UserPreferencesDto>>> {
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
        { success: false, error: "Invalid JSON body", code: "BAD_REQUEST" },
        { status: 400 }
      );
    }

    const validation = UpdatePreferencesSchema.safeParse(body);
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
          error: "At least one preference field must be provided for update",
          code: "NO_UPDATES",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updatedUser = await User.findOneAndUpdate(
      { clerkId: userId },
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User not found in database", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const data: UserPreferencesDto = {
      clerkId: updatedUser.clerkId,
      email: updatedUser.email,
      name: updatedUser.name,
      timezone: updatedUser.timezone,
      dailyTargetMinutes: updatedUser.dailyTargetMinutes,
      focusDurationMinutes: updatedUser.focusDurationMinutes,
      preferredWorkBlocks: updatedUser.preferredWorkBlocks,
      updatedAt: updatedUser.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data,
      message: "Planning preferences updated successfully",
    });
  } catch (error) {
    console.error("PUT /api/preferences error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update planning preferences",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
