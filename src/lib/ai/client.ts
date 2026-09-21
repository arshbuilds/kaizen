import { GoogleGenAI, Type } from "@google/genai";

/**
 * Initializes and returns the official GoogleGenAI client
 * using the server-side GEMINI_API_KEY environment variable.
 */
export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not defined. Please configure it in your .env.local"
    );
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * The configured model ID for goal decomposition.
 * Defaults to 'gemini-2.5-flash' (or 'gemini-3.7-flash').
 */
export const GEMINI_DECOMPOSE_MODEL =
  process.env.GEMINI_DECOMPOSE_MODEL || "gemini-2.5-flash";

/**
 * Native Gemini response schema definition enforcing
 * strict JSON structured output for Goal Roadmap Decomposition.
 */
export const GEMINI_ROADMAP_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description:
        "A concise 2-sentence summary of the curriculum and pedagogical approach of this roadmap.",
    },
    outcomes: {
      type: Type.ARRAY,
      description: "List of 2 to 4 major domain capability pillars.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "Name of the capability pillar or core outcome.",
          },
          description: {
            type: Type.STRING,
            description: "High-level description of what this outcome achieves.",
          },
          order: {
            type: Type.INTEGER,
            description: "Zero-indexed display sequence.",
          },
          milestones: {
            type: Type.ARRAY,
            description: "Sequential progress gates under this outcome.",
            items: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                  description: "Name of this milestone checkpoint.",
                },
                description: {
                  type: Type.STRING,
                  description: "Checkpoint success criteria or definition of done.",
                },
                order: {
                  type: Type.INTEGER,
                  description: "Zero-indexed display sequence.",
                },
                actions: {
                  type: Type.ARRAY,
                  description: "Atomic 15-90 minute executable actions.",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: {
                        type: Type.STRING,
                        description:
                          "Verb-first concrete task (e.g., 'Implement redis caching layer').",
                      },
                      description: {
                        type: Type.STRING,
                        description:
                          "Brief instruction or context for completing this task.",
                      },
                      estimatedMinutes: {
                        type: Type.INTEGER,
                        description:
                          "Realistic estimated duration strictly between 15 and 90 minutes.",
                      },
                      cognitiveLoad: {
                        type: Type.STRING,
                        enum: ["deep_work", "shallow_work", "learning"],
                        description: "Cognitive nature of the work session.",
                      },
                      difficulty: {
                        type: Type.STRING,
                        enum: ["easy", "medium", "hard"],
                        description: "Technical complexity of this action.",
                      },
                    },
                    required: [
                      "title",
                      "estimatedMinutes",
                      "cognitiveLoad",
                      "difficulty",
                    ],
                  },
                },
              },
              required: ["title", "order", "actions"],
            },
          },
        },
        required: ["title", "order", "milestones"],
      },
    },
  },
  required: ["summary", "outcomes"],
};
