import { FirestoreTimestamp } from "../lib/firebase";

export type goalInputType = {
  title: string;
  description: string;
  createdAt: FirestoreTimestamp;
  weeks: number;
  tags: Array<string>;
  totalTodos: number;
  doneTodos: number;
};

export type goalOutputType = {
  goalId: string;
  title: string;
  description: string;
  createdAt: FirestoreTimestamp;
  weeks: number;
  tags: Array<string>;
  totalTodos: number;
  doneTodos: number;
  timeSpent: number;
};
