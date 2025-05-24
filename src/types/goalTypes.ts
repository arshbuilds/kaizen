import { FirestoreTimestamp } from "../lib/firebase";

export type goalType = {
    goalId: string;
    title: string;
    description: string;
    createdAt: FirestoreTimestamp;
    weeks: number;
    tags: Array<string>;
}

