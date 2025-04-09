import { FirestoreTimestamp } from "../lib/firebase";

export type habitType = {
  habitId: string;
  title: string;
  streak: number;
  status: boolean;
  lastCompleted: FirestoreTimestamp; 
  createdAt: FirestoreTimestamp;
};

export type partialHabitType = Partial<habitType>;
