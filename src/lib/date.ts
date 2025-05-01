import { Timestamp } from "firebase/firestore";
import { FirestoreTimestamp } from "./firebase";

export const getYearFromTimestamp = (
  timestamp: FirestoreTimestamp
): number | null => {
  let date: Date | null = null;
  if (timestamp instanceof Timestamp) {
    date = timestamp.toDate(); // Convert Firestore Timestamp to Date
  } else if (timestamp instanceof Date) {
    date = timestamp; // If it's already a Date, use it
  }
  return date ? date.getFullYear() : null;
};
