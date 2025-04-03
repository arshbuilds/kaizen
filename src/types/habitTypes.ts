import { FirestoreTimestamp } from "../lib/firebase";

export type habitType = {
  habitId: string;
  title: string;
  streak: number;
  status: boolean;
  lastCompleted: FirestoreTimestamp; //TODO:- change into server time stamp later
  createdAt: FirestoreTimestamp;
};

export type formHabitType = Omit<habitType, "habitId" | "createdAt">;
export type updateHabitType = Partial<habitType>;
