import { FirestoreTimestamp } from "../lib/firebase";

export type goalType = {
    goalId: string;
    title: string;
    description: string;
    status: string;
    createdAt: FirestoreTimestamp;
    dueBy: FirestoreTimestamp;
    tags: Array<string>;
}

