import { Message, ChatSession } from "../types";
import { supabase } from "../../shared/supabase";

export class SupabaseChatService {
    private static normalizeMessage(raw: any): Message {
        const text =
            typeof raw?.text === "string"
                ? raw.text
                : typeof raw?.content === "string"
                  ? raw.content
                  : "";

        const model =
            typeof raw?.model === "string"
                ? raw.model.startsWith("gemini-") &&
                  !raw.model.includes("thinking")
                    ? `${raw.model}-thinking`
                    : raw.model
                : raw?.model;

        return {
            ...raw,
            text,
            model,
        };
    }

    static async fetchChats(): Promise<ChatSession[]> {
        // We rely on RLS to filter chats for the current user.
        const { data, error } = await supabase
            .from("chats")
            .select("*")
            .order("updated_at", { ascending: false });

        if (error) {
            console.error("Error fetching chats:", error);
            throw new Error(error.message);
        }

        return (data || []).map((chat: any) => ({
            id: chat.id,
            title: chat.title,
            messages: Array.isArray(chat.messages)
                ? chat.messages.map((message: any) =>
                      SupabaseChatService.normalizeMessage(message),
                  )
                : [],
            updatedAt: new Date(chat.updated_at).getTime(),
        }));
    }

    static async saveChat(
        id: string | null,
        msgs: Message[],
        title: string,
    ): Promise<ChatSession> {
        // Get current user to ensure we save with correct user_id
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        // If it's a new chat (id is null), generate a UUID.
        // If it's an existing chat, use the passed id.
        const chatId = id || crypto.randomUUID();
        const now = new Date().toISOString();

        const chatData = {
            id: chatId,
            user_id: user.id,
            title: title,
            messages: msgs,
            updated_at: now,
        };

        const { data, error } = await supabase
            .from("chats")
            .upsert(chatData)
            .select()
            .single();

        if (error) {
            console.error("Error saving chat:", error);
            throw new Error(error.message);
        }

        return {
            id: data.id,
            title: data.title,
            messages: Array.isArray(data.messages)
                ? data.messages.map((message: any) =>
                      SupabaseChatService.normalizeMessage(message),
                  )
                : [],
            updatedAt: new Date(data.updated_at).getTime(),
        };
    }

    static async updateChatTitle(
        chatId: string,
        newTitle: string,
    ): Promise<void> {
        const { data: existingChat, error: fetchError } = await supabase
            .from("chats")
            .select("id, user_id, messages")
            .eq("id", chatId)
            .single();

        if (fetchError || !existingChat) {
            console.error("Error loading chat before rename:", fetchError);
            throw new Error(fetchError?.message || "Chat not found");
        }

        const { error } = await supabase.from("chats").upsert({
            id: existingChat.id,
            user_id: existingChat.user_id,
            messages: existingChat.messages ?? [],
            title: newTitle,
            updated_at: new Date().toISOString(),
        });

        if (error) {
            console.error("Error updating chat title:", error);
            throw new Error(error.message);
        }
    }

    static async deleteChat(id: string): Promise<void> {
        const { error } = await supabase.from("chats").delete().eq("id", id);

        if (error) {
            console.error("Error deleting chat:", error);
            throw new Error(error.message);
        }
    }
}
