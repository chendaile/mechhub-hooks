import type { ChatSession, Message } from "../types";
import {
    deleteChat,
    fetchChats,
    saveChat,
    updateChatTitle,
} from "../services/chat/chatRepositoryService";

export class SupabaseChatService {
    static async fetchChats(): Promise<ChatSession[]> {
        return fetchChats();
    }

    static async saveChat(
        id: string | null,
        messages: Message[],
        title: string,
    ): Promise<ChatSession> {
        return saveChat(id, messages, title);
    }

    static async updateChatTitle(
        chatId: string,
        newTitle: string,
    ): Promise<void> {
        await updateChatTitle(chatId, newTitle);
    }

    static async deleteChat(id: string): Promise<void> {
        await deleteChat(id);
    }
}
