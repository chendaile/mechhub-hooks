import type { ChatRepositoryPort } from "../application/ports/ChatRepositoryPort";
import { SupabaseChatService } from "./supabaseChatService";

export const createSupabaseChatRepository = (): ChatRepositoryPort => ({
    fetchChats: () => SupabaseChatService.fetchChats(),
    saveChat: (id, messages, title) => SupabaseChatService.saveChat(id, messages, title),
    updateChatTitle: (id, newTitle) => SupabaseChatService.updateChatTitle(id, newTitle),
    deleteChat: (id) => SupabaseChatService.deleteChat(id),
});
