import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/db/mongodb";
import { Goal } from "@/src/lib/db/models/Goal";
import { User } from "@/src/lib/db/models/User";
import {
  getGeminiClient,
  GEMINI_DECOMPOSE_MODEL,
  GEMINI_ROADMAP_RESPONSE_SCHEMA,
} from "@/src/lib/ai/client";
import { buildDecompositionPrompt } from "@/src/lib/ai/prompts/decomposition";
import {
  DecomposedRoadmapSchema,
  DecomposedRoadmapDto,
} from "@/src/lib/validations/decompositionSchemas";
import { ApiResponse } from "@/src/types/api";
import mongoose from "mongoose";

interface RouteContext {
  params: Promise<{ goalId: string }>;
}

export async function POST(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<DecomposedRoadmapDto>>> {
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

    // Fetch the target goal
    const goal = await Goal.findOne({ _id: goalId, userId }).lean();
    if (!goal) {
      return NextResponse.json(
        { success: false, error: "Goal not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // Fetch user preferences for planning capacity
    const user = await User.findOne({ clerkId: userId }).lean();
    const dailyTargetMinutes = user?.dailyTargetMinutes || 180;

    // Build the AI prompt
    const prompt = buildDecompositionPrompt({
      title: goal.title,
      whyItMatters: goal.whyItMatters,
      targetWeeks: goal.targetWeeks,
      dailyTargetMinutes,
    });

    // Invoke Gemini with native JSON schema enforcement
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: GEMINI_DECOMPOSE_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: GEMINI_ROADMAP_RESPONSE_SCHEMA,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      return NextResponse.json(
        {
          success: false,
          error: "AI model returned empty response",
          code: "AI_EMPTY_RESPONSE",
        },
        { status: 502 }
      );
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to parse AI output as JSON",
          code: "AI_PARSE_ERROR",
        },
        { status: 502 }
      );
    }

    // Strictly validate against our Zod schema
    const validation = DecomposedRoadmapSchema.safeParse(parsedJson);
    if (!validation.success) {
      console.error(
        "Decomposition schema validation error:",
        validation.error.format()
      );
      return NextResponse.json(
        {
          success: false,
          error: "AI roadmap did not conform to execution constraints",
          code: "AI_VALIDATION_ERROR",
          details: validation.error.format(),
        },
        { status: 502 }
      );
    }

    const data: DecomposedRoadmapDto = validation.data;

    return NextResponse.json({
      success: true,
      data,
      message: "Draft roadmap decomposed successfully",
    });
  } catch (error) {
    console.error("POST /api/goals/[goalId]/decompose error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to decompose goal with AI",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
