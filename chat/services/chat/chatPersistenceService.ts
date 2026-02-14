import { supabase } from "../../../shared/supabase";
import type { ChatSession, Message } from "../../types";
import { normalizeChatRecord } from "./chatRecordMapper";

const readCurrentUserId = async (): Promise<string> => {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("User not authenticated");
    }

    return user.id;
};

export const fetchChats = async (): Promise<ChatSession[]> => {
    const { data, error } = await supabase
        .from("chats")
        .select("*")
        .order("updated_at", { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return Array.isArray(data) ? data.map(normalizeChatRecord) : [];
};

export const saveChat = async (
    id: string | null,
    messages: Message[],
    title: string,
): Promise<ChatSession> => {
    const userId = await readCurrentUserId();
    const chatId = id || crypto.randomUUID();
    const now = new Date().toISOString();

    const chatData = {
        id: chatId,
        user_id: userId,
        title,
        messages,
        updated_at: now,
    };

    const { data, error } = await supabase
        .from("chats")
        .upsert(chatData)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return normalizeChatRecord(data);
};

export const updateChatTitle = async (
    chatId: string,
    newTitle: string,
): Promise<void> => {
    const { data: existingChat, error: fetchError } = await supabase
        .from("chats")
        .select("id, user_id, messages")
        .eq("id", chatId)
        .single();

    if (fetchError || !existingChat) {
        throw new Error(fetchError?.message || "Chat not found");
    }

    const { error } = await supabase.from("chats").upsert({
        id: existingChat.id,
        user_id: existingChat.user_id,
        messages: Array.isArray(existingChat.messages)
            ? existingChat.messages
            : [],
        title: newTitle,
        updated_at: new Date().toISOString(),
    });

    if (error) {
        throw new Error(error.message);
    }
};

export const deleteChat = async (id: string): Promise<void> => {
    const { error } = await supabase.from("chats").delete().eq("id", id);

    if (error) {
        throw new Error(error.message);
    }
};
