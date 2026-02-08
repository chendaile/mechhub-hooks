import type { Message } from "../../types/message";
import type { ChatSession } from "../../types/session";

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
