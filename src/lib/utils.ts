import { kebabCase } from "lodash";
import { Timestamp } from "firebase/firestore";
import { FirestoreTimestamp } from "./firebase";

export const turnIntoKebab = (text: string) => {
  return kebabCase(text);
};

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
