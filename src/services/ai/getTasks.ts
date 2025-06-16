import Groq from "groq-sdk";
import { getNextWeekPrompt, startWeekPrompt } from "./prompts";

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function getTasksFromPrompt(prompt: string, weeks: number) {
  let returned = "";
  const chatCompletion = await getGroqChatCompletion(startWeekPrompt(prompt));
  returned += chatCompletion.choices[0]?.message?.content || "";
  let latest = returned;
  for (let i = 0; i < weeks - 1; i++) {
    const next = await getGroqChatCompletion(getNextWeekPrompt(latest, i, weeks));
    latest = (next.choices[0]?.message?.content || "")
      .replace(/```.*?\s/, "")
      .replace(/```$/, "")
      .replace(/`/g, "")
      .trim();
    returned += "," + latest;
  }
  const result = returned
    .replace(/```.*?\s/, "")
    .replace(/```$/, "")
    .replace(/`/g, "")
    .trim();
  return JSON.parse("[" + result + "]");
}

export async function getGroqChatCompletion(prompt: string) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "llama-3.3-70b-versatile",
  });
}
