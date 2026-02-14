export type ClassThreadType = "group" | "shared_chat" | "shared_grade";

export interface ClassThread {
    id: string;
    classId: string;
    threadType: ClassThreadType;
    title: string;
    createdByUserId?: string | null;
    sourceChatId?: string | null;
    sourceGradeRef?: string | null;
    createdAt: string;
    updatedAt: string;
}

export type ClassThreadMessageRole = "user" | "assistant" | "system";

export interface ClassThreadMessage {
    id: string;
    threadId: string;
    senderUserId?: string | null;
    senderName?: string | null;
    senderEmail?: string | null;
    senderAvatar?: string | null;
    role: ClassThreadMessageRole;
    content: Record<string, unknown>;
    mentionsAi: boolean;
    replyToMessageId?: string | null;
    createdAt: string;
}

export interface PostClassMessageResult {
    message: ClassThreadMessage;
    aiMessage?: ClassThreadMessage | null;
}

export interface DeleteClassThreadResult {
    success: boolean;
    classId: string;
    threadId: string;
}
