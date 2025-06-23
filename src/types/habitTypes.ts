import { FirestoreTimestamp } from "../lib/firebase";

export type habitOutputType = {
  habitId: string;
  title: string;
  streak: number;
  status: boolean;
  lastCompleted: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
  category: string;
};

export type habitInputType = Omit<habitOutputType, "status">;

export type partialHabitType = Partial<habitOutputType>;
