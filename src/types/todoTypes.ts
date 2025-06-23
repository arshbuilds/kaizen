import { FirestoreTimestamp } from "../lib/firebase";

export type todoOutputType = {
    todoId: string;
    title: string;
    xp: number;
    coins: number;
    description: string;
    status: boolean;
    priority: string;
    goalId: string;
    timeRequired: number;
    
}

export type todoInputType = {
    title: string;
    description: string;
    xp: number;
    coins: number;
    status: boolean;
    priority: string;
    timeRequired: number;
}

export type todoParentType = {
    createdAt: FirestoreTimestamp; 
    dueDate: FirestoreTimestamp; 
};

export type partialtodoOutputType = Partial<todoOutputType>