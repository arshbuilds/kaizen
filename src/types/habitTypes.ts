import { FirestoreTimestamp } from "../lib/firebase";

export type habitOutputType = {
  habitId: string;
  title: string;
  streak: number;
  status: boolean;
  lastCompleted: string|null;
  createdAt: FirestoreTimestamp;
  category: string;
  timeRequired: number
};

export type habitInputType = Omit<habitOutputType, "status">;

export type partialHabitType = Partial<habitOutputType>;
