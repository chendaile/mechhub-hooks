import type { ChatSession, Message } from "../../types";

interface RawChatRecord {
    id?: unknown;
    title?: unknown;
    messages?: unknown;
    updated_at?: unknown;
}

interface RawMessageRecord {
    text?: unknown;
    content?: unknown;
    model?: unknown;
}

export const normalizeMessageRecord = (raw: unknown): Message => {
    const record = (raw ?? {}) as RawMessageRecord & Message;

    const text =
        typeof record.text === "string"
            ? record.text
            : typeof record.content === "string"
              ? record.content
              : "";

    const model =
        typeof record.model === "string"
            ? record.model.startsWith("gemini-") &&
              !record.model.includes("thinking")
                ? `${record.model}-thinking`
                : record.model
            : record.model;

    return {
        ...record,
        text,
        model,
    } as Message;
};

export const normalizeChatRecord = (raw: unknown): ChatSession => {
    const record = (raw ?? {}) as RawChatRecord;

    return {
        id: typeof record.id === "string" ? record.id : "",
        title: typeof record.title === "string" ? record.title : "",
        messages: Array.isArray(record.messages)
            ? record.messages.map(normalizeMessageRecord)
            : [],
        updatedAt:
            typeof record.updated_at === "string"
                ? new Date(record.updated_at).getTime()
                : Date.now(),
    };
};
