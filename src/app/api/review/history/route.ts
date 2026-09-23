import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/db/mongodb";
import { WeeklyReview } from "@/src/lib/db/models/WeeklyReview";
import { WeeklyReviewSummaryDto } from "@/src/lib/validations/reviewSchemas";
import { ApiResponse } from "@/src/types/api";

/**
 * GET /api/review/history
 *
 * Returns the user's last 12 weekly reviews in reverse chronological order.
 * Used to power the "Past Reviews" section of the Review page.
 *
 * Each entry is a lightweight WeeklyReviewSummaryDto — no reflection
 * notes or AI insights included to keep the response payload small.
 * The frontend can fetch a full review detail if needed (future).
 */
export async function GET(): Promise<
  NextResponse<ApiResponse<WeeklyReviewSummaryDto[]>>
> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const reviews = await WeeklyReview.find({ userId })
      .sort({ weekStart: -1 })
      .limit(12)
      .lean();

    const dtos: WeeklyReviewSummaryDto[] = reviews.map((r) => {
      // Compute weekEnd from weekStart
      const weekStartDate = new Date(r.weekStart + "T00:00:00.000Z");
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 6);
      const weekEnd = weekEndDate.toISOString().split("T")[0];

      return {
        id: r._id.toString(),
        weekStart: r.weekStart,
        weekEnd,
        totalCompletedMinutes: r.totalCompletedMinutes,
        completedSessionsCount: r.completedSessionsCount,
        energyRating: r.energyRating,
        focusRating: r.focusRating,
        aiInsight: r.aiInsight,
        createdAt: r.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ success: true, data: dtos });
  } catch (error) {
    console.error("GET /api/review/history error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load review history",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
