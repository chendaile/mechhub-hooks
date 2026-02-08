import type { Message } from "./message";

export interface ChatSession {
    id: string;
    title: string;
    updatedAt: number;
    messages?: Message[];
    isGeneratingTitle?: boolean;
}
