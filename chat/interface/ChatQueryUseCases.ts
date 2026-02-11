import type { Message, ChatSession } from "../types";

export interface ChatQueryUseCases {
    fetchChats(): Promise<ChatSession[]>;
    saveChat(
        id: string | null,
        messages: Message[],
        title: string,
    ): Promise<ChatSession>;
    deleteChat(id: string): Promise<void>;
    renameChat(id: string, newTitle: string): Promise<void>;
    generateTitle(messages: Message[]): Promise<string>;
}
