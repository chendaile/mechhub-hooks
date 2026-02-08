import type { Message } from "../../types/message";
import type { ChatSession } from "../../types/session";

export interface ChatRepositoryPort {
    fetchChats(): Promise<ChatSession[]>;
    saveChat(id: string | null, messages: Message[], title: string): Promise<ChatSession>;
    updateChatTitle(id: string, newTitle: string): Promise<void>;
    deleteChat(id: string): Promise<void>;
}


