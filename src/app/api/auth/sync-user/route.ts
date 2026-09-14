import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/db/mongodb";
import { User } from "@/src/lib/db/models/User";
import { UserPreferencesDto } from "@/src/lib/validations/userSchemas";
import { ApiResponse } from "@/src/types/api";

export async function POST(): Promise<NextResponse<ApiResponse<UserPreferencesDto>>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { success: false, error: "User session not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    await connectToDatabase();

    const primaryEmail =
      clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId
      )?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress;

    if (!primaryEmail) {
      return NextResponse.json(
        { success: false, error: "No primary email found", code: "BAD_REQUEST" },
        { status: 400 }
      );
    }

    const fullName =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      clerkUser.username ||
      "Kaizen User";

    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      {
        $set: {
          email: primaryEmail,
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

    const data: UserPreferencesDto = {
      clerkId: user.clerkId,
      email: user.email,
      name: user.name,
      timezone: user.timezone,
      dailyTargetMinutes: user.dailyTargetMinutes,
      focusDurationMinutes: user.focusDurationMinutes,
      preferredWorkBlocks: user.preferredWorkBlocks,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data,
      message: "User synced successfully",
    });
  } catch (error) {
    console.error("Error syncing user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to sync user to database",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
