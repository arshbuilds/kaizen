import { FirestoreTimestamp } from "../lib/firebase";

export type todoOutputType = {
    todoId: string;
    title: string;
    description: string;
    status: boolean;
    priority: string;
    goalId: string;
}

export type todoInputType = {
    title: string;
    description: string;
    status: boolean;
    priority: string;
}

export type todoParentType = {
    createdAt: FirestoreTimestamp; 
    dueDate: FirestoreTimestamp; 
};

export type partialtodoOutputType = Partial<todoOutputType>