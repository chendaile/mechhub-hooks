import type { Message } from "../types";
import { normalizeSnapshotMessage, normalizeSnapshotMessages } from "./normalizeSnapshotMessage";

export interface SnapshotPreview {
    title: string;
    capturedAt: string | null;
    messages: Message[];
}

export const buildSnapshotPreview = (snapshot: unknown): SnapshotPreview => {
    if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
        return {
            title: "私聊会话",
            capturedAt: null,
            messages: [],
        };
    }

    const record = snapshot as Record<string, unknown>;
    const title =
        typeof record.sourceTitle === "string" && record.sourceTitle.trim()
            ? record.sourceTitle
            : "私聊会话";
    const capturedAt =
        typeof record.capturedAt === "string" ? record.capturedAt : null;
    const kind =
        typeof record.kind === "string" ? record.kind : "chat_session_snapshot";

    if (kind === "chat_response_snapshot") {
        const message = normalizeSnapshotMessage(record.targetMessage);
        return {
            title,
            capturedAt,
            messages: message ? [message] : [],
        };
    }

    return {
        title,
        capturedAt,
        messages: normalizeSnapshotMessages(record.messages),
    };
};
