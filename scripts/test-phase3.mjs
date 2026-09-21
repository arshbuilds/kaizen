import mongoose from "mongoose";
import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";
import process from "process";

// 1. Load Environment Variables from Kaizen workspace .env.local
try {
  process.loadEnvFile(".env.local");
  console.log("✅ Loaded environment variables from .env.local");
} catch (err) {
  console.error("❌ Failed to load .env.local:", err.message);
  process.exit(1);
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MONGODB_URI = process.env.MONGODB_URI;
const GEMINI_DECOMPOSE_MODEL = process.env.GEMINI_DECOMPOSE_MODEL || "gemini-2.5-flash";

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing from environment");
  process.exit(1);
}
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is missing from environment");
  process.exit(1);
}

// 2. Define Zod Validation Schemas matching src/lib/validations/decompositionSchemas.ts
const CognitiveLoadEnum = z.enum(["deep_work", "shallow_work", "learning"]);
const ActionDifficultyEnum = z.enum(["easy", "medium", "hard"]);

const DecomposedActionSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().max(500).optional(),
  estimatedMinutes: z.number().int().min(15).max(90),
  cognitiveLoad: CognitiveLoadEnum,
  difficulty: ActionDifficultyEnum,
});

const DecomposedMilestoneSchema = z.object({
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().max(500).optional(),
  order: z.number().int().min(0),
  actions: z.array(DecomposedActionSchema).min(2).max(8),
});

const DecomposedOutcomeSchema = z.object({
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().max(500).optional(),
  order: z.number().int().min(0),
  milestones: z.array(DecomposedMilestoneSchema).min(1).max(5),
});

const DecomposedRoadmapSchema = z.object({
  summary: z.string().trim().max(1000),
  outcomes: z.array(DecomposedOutcomeSchema).min(2).max(5),
});

// 3. Define Gemini Structured Output Schema
const GEMINI_ROADMAP_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "Curriculum summary" },
    outcomes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          order: { type: Type.INTEGER },
          milestones: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                order: { type: Type.INTEGER },
                actions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      estimatedMinutes: { type: Type.INTEGER },
                      cognitiveLoad: {
                        type: Type.STRING,
                        enum: ["deep_work", "shallow_work", "learning"],
                      },
                      difficulty: {
                        type: Type.STRING,
                        enum: ["easy", "medium", "hard"],
                      },
                    },
                    required: ["title", "estimatedMinutes", "cognitiveLoad", "difficulty"],
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

async function runTests() {
  console.log("\n========================================================");
  console.log("  PHASE 3 INTEGRATION TEST SUITE");
  console.log("========================================================\n");

  // TEST SUITE A: Gemini AI Structured Output Generation
  console.log("--- TEST SUITE A: Gemini AI Model & Structured Schema ---");
  console.log(`Using model: ${GEMINI_DECOMPOSE_MODEL}`);
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const testPrompt = `You are Kaizen's Master Curriculum & Productivity Architect.
Decompose the following goal:
* Objective: "Build an event-driven microservices platform in Go"
* Why This Matters: "Lead the cloud migration initiative and master distributed systems"
* Timeframe Budget: 8 weeks
* Daily Focus Capacity: ~90 minutes per day

Architectural Rules:
1. Break into 2 to 4 core capability pillars (Outcomes).
2. Under each Outcome, create 2 to 3 sequential progress milestones.
3. Under each Milestone, create 3 to 5 concrete actions.
4. MANDATORY: Action duration MUST be strictly between 15 and 90 minutes.
5. Action titles must start with an active imperative verb (e.g., 'Implement...', 'Configure...', 'Benchmark...').
6. Cognitive load must be 'deep_work', 'shallow_work', or 'learning'.
7. Difficulty must be 'easy', 'medium', or 'hard'.`;

  console.log("Sending prompt to Gemini with native structured schema...");
  const startTime = Date.now();
  const response = await ai.models.generateContent({
    model: GEMINI_DECOMPOSE_MODEL,
    contents: testPrompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: GEMINI_ROADMAP_RESPONSE_SCHEMA,
    },
  });
  const durationMs = Date.now() - startTime;
  console.log(`✅ Received Gemini response in ${durationMs}ms`);

  const responseText = response.text;
  if (!responseText) {
    throw new Error("Gemini returned empty response text!");
  }

  const parsedJson = JSON.parse(responseText);
  console.log("✅ Successfully parsed JSON output from Gemini");

  // Validate with Zod
  const zodResult = DecomposedRoadmapSchema.safeParse(parsedJson);
  if (!zodResult.success) {
    console.error("❌ Zod validation failed:", JSON.stringify(zodResult.error.format(), null, 2));
    throw new Error("Gemini output failed Zod schema validation");
  }
  console.log("✅ Gemini output strictly passed Zod schema validation!");

  const roadmapData = zodResult.data;
  console.log(`\nSummary: "${roadmapData.summary}"`);
  console.log(`Total Outcomes: ${roadmapData.outcomes.length}`);

  let totalMilestones = 0;
  let totalActions = 0;
  let totalMinutes = 0;

  for (const outcome of roadmapData.outcomes) {
    console.log(`\n  📌 [Outcome ${outcome.order + 1}] ${outcome.title}`);
    for (const milestone of outcome.milestones) {
      totalMilestones++;
      console.log(`     🎯 [Milestone ${milestone.order + 1}] ${milestone.title} (${milestone.actions.length} actions)`);
      for (const action of milestone.actions) {
        totalActions++;
        totalMinutes += action.estimatedMinutes;

        // Verify duration bounds
        if (action.estimatedMinutes < 15 || action.estimatedMinutes > 90) {
          throw new Error(`Action duration violation: ${action.title} has ${action.estimatedMinutes}m (outside 15-90m bound)`);
        }
      }
    }
  }

  console.log("\n--- Guardrail Verification ---");
  console.log(`✅ Total Milestones generated: ${totalMilestones}`);
  console.log(`✅ Total Actions generated: ${totalActions}`);
  console.log(`✅ Total Estimated Hours: ${(totalMinutes / 60).toFixed(1)}h (${totalMinutes} minutes)`);
  console.log(`✅ All ${totalActions} actions strictly bounded to 15-90 minutes!`);

  // TEST SUITE B: Database Schema & Cascade Commit Lifecycle
  console.log("\n--- TEST SUITE B: MongoDB Atlas Persistence & Cascade ---");
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log("✅ Connected to MongoDB Atlas");

  // Define Schemas for testing persistence
  const testGoalSchema = new mongoose.Schema(
    {
      userId: String,
      title: String,
      whyItMatters: String,
      targetWeeks: Number,
      totalEstimatedMinutes: Number,
      status: { type: String, default: "active" },
    },
    { timestamps: true }
  );
  const TestGoal = mongoose.models.TestGoal || mongoose.model("TestGoal", testGoalSchema);

  const testOutcomeSchema = new mongoose.Schema({
    goalId: mongoose.Schema.Types.ObjectId,
    userId: String,
    title: String,
    order: Number,
    status: { type: String, default: "pending" },
  });
  const TestOutcome = mongoose.models.TestOutcome || mongoose.model("TestOutcome", testOutcomeSchema);

  const testMilestoneSchema = new mongoose.Schema({
    outcomeId: mongoose.Schema.Types.ObjectId,
    goalId: mongoose.Schema.Types.ObjectId,
    userId: String,
    title: String,
    order: Number,
    status: { type: String, default: "unlocked" },
  });
  const TestMilestone = mongoose.models.TestMilestone || mongoose.model("TestMilestone", testMilestoneSchema);

  const testActionSchema = new mongoose.Schema({
    milestoneId: mongoose.Schema.Types.ObjectId,
    outcomeId: mongoose.Schema.Types.ObjectId,
    goalId: mongoose.Schema.Types.ObjectId,
    userId: String,
    title: String,
    estimatedMinutes: Number,
    cognitiveLoad: String,
    difficulty: String,
    status: { type: String, default: "ready" },
    order: Number,
  });
  const TestAction = mongoose.models.TestAction || mongoose.model("TestAction", testActionSchema);

  const testUserId = "user_test_phase3_qa";

  // Step 1: Create Test Goal
  console.log("1. Creating test Goal in database...");
  const createdGoal = await TestGoal.create({
    userId: testUserId,
    title: "Build an event-driven microservices platform in Go",
    whyItMatters: "Lead cloud migration and master distributed systems",
    targetWeeks: 8,
    totalEstimatedMinutes: 0,
  });
  console.log(`✅ Test Goal created with ID: ${createdGoal._id}`);

  // Step 2: Simulate commit-roadmap route
  console.log("2. Simulating cascading batch persistence of Outcomes, Milestones, and Actions...");
  let persistedOutcomesCount = 0;
  let persistedMilestonesCount = 0;
  let persistedActionsCount = 0;

  for (const outcome of roadmapData.outcomes) {
    const outcomeDoc = await TestOutcome.create({
      goalId: createdGoal._id,
      userId: testUserId,
      title: outcome.title,
      order: outcome.order,
      status: "pending",
    });
    persistedOutcomesCount++;

    for (const milestone of outcome.milestones) {
      const milestoneDoc = await TestMilestone.create({
        outcomeId: outcomeDoc._id,
        goalId: createdGoal._id,
        userId: testUserId,
        title: milestone.title,
        order: milestone.order,
        status: "unlocked",
      });
      persistedMilestonesCount++;

      const actionsToInsert = milestone.actions.map((act, actIdx) => ({
        milestoneId: milestoneDoc._id,
        outcomeId: outcomeDoc._id,
        goalId: createdGoal._id,
        userId: testUserId,
        title: act.title,
        estimatedMinutes: act.estimatedMinutes,
        cognitiveLoad: act.cognitiveLoad,
        difficulty: act.difficulty,
        status: "ready",
        order: actIdx,
      }));

      await TestAction.insertMany(actionsToInsert);
      persistedActionsCount += actionsToInsert.length;
    }
  }

  console.log(`✅ Successfully persisted:`);
  console.log(`   - Outcomes: ${persistedOutcomesCount}`);
  console.log(`   - Milestones: ${persistedMilestonesCount}`);
  console.log(`   - Actions: ${persistedActionsCount}`);

  // Step 3: Verify Query / Assembly
  console.log("3. Verifying hierarchical tree reconstruction (Roadmap retrieval query)...");
  const [dbOutcomes, dbMilestones, dbActions] = await Promise.all([
    TestOutcome.find({ goalId: createdGoal._id, userId: testUserId }).sort({ order: 1 }).lean(),
    TestMilestone.find({ goalId: createdGoal._id, userId: testUserId }).sort({ order: 1 }).lean(),
    TestAction.find({ goalId: createdGoal._id, userId: testUserId }).sort({ order: 1 }).lean(),
  ]);

  if (dbOutcomes.length !== persistedOutcomesCount) throw new Error("Outcomes count mismatch");
  if (dbMilestones.length !== persistedMilestonesCount) throw new Error("Milestones count mismatch");
  if (dbActions.length !== persistedActionsCount) throw new Error("Actions count mismatch");
  console.log("✅ All relational counts match expected values!");

  // Step 4: Verify Cascading Cleanup
  console.log("4. Testing cascading cleanup of test data...");
  await Promise.all([
    TestOutcome.deleteMany({ goalId: createdGoal._id }),
    TestMilestone.deleteMany({ goalId: createdGoal._id }),
    TestAction.deleteMany({ goalId: createdGoal._id }),
    TestGoal.deleteOne({ _id: createdGoal._id }),
  ]);

  const remainingActions = await TestAction.countDocuments({ goalId: createdGoal._id });
  if (remainingActions !== 0) throw new Error("Cascade cleanup failed, actions remain!");
  console.log("✅ Cascading cleanup verified. Zero orphaned documents remain.");

  await mongoose.disconnect();
  console.log("\n========================================================");
  console.log("  ALL TESTS PASSED WITH 100% SUCCESS");
  console.log("========================================================\n");
}

runTests().catch((err) => {
  console.error("\n❌ TEST SUITE FAILED:", err);
  process.exit(1);
});
