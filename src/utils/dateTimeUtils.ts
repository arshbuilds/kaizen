import { Timestamp } from "firebase/firestore";
import { FirestoreTimestamp } from "../lib/firebase";

function convertToDate(value: FirestoreTimestamp): Date | null {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  return null; // FieldValue cannot be converted to Date
}

export function wasCompletedYesterday(
  lastCompleted: FirestoreTimestamp
): boolean {
  const now = new Date();
  const completedDate = lastCompleted ? convertToDate(lastCompleted) : null;
  if (!completedDate) return false;

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const completed = new Date(
    completedDate.getFullYear(),
    completedDate.getMonth(),
    completedDate.getDate()
  );
  const diffTime = today.getTime() - completed.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  return diffDays === 0 || diffDays === 1;
}

export function getStartAndEndOfToday() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(start.getDate() + 1);
  return { start, end };
}


export function getNextWeekdayDate(weekday: string, weekOffset = 0): Date {
  const dayMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  const targetDay = dayMap[weekday.toLowerCase()];
  const today = new Date();
  const day = today.getDay();

  let diff = (targetDay + 7 - day) % 7;
  if (diff === 0) diff = 7; // Always go to next week, not today

  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + diff + weekOffset * 7);
  return targetDate;
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}
