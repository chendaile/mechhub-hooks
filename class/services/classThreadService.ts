import type {
    ClassThread,
    ClassThreadMessage,
    PostClassMessagePayload,
    PostClassMessageResult,
    ShareGradeResultPayload,
    SharePrivateChatPayload,
} from "../types";
import {
    normalizeClassThread,
    normalizeClassThreadMessage,
} from "./classNormalizers";
import { invokeClassChat } from "./classTransport";

export const listClassThreads = async (
    classId: string,
): Promise<ClassThread[]> => {
    const result = await invokeClassChat<{ threads?: unknown[] }>({
        action: "list_threads",
        class_id: classId,
    });

    return Array.isArray(result.threads)
        ? result.threads.map(normalizeClassThread).filter((thread) => thread.id)
        : [];
};

export const createGroupThread = async (
    classId: string,
    title: string,
): Promise<ClassThread> => {
    const result = await invokeClassChat<{ thread?: unknown }>({
        action: "create_group_thread",
        class_id: classId,
        title,
    });

    return normalizeClassThread(result.thread);
};

export const getClassThreadMessages = async (
    threadId: string,
    cursor?: string,
): Promise<ClassThreadMessage[]> => {
    const result = await invokeClassChat<{ messages?: unknown[] }>({
        action: "get_thread_messages",
        thread_id: threadId,
        cursor: cursor ?? "",
    });

    return Array.isArray(result.messages)
        ? result.messages
              .map(normalizeClassThreadMessage)
              .filter((message) => message.id)
        : [];
};

export const postClassMessage = async (
    payload: PostClassMessagePayload,
): Promise<PostClassMessageResult> => {
    const result = await invokeClassChat<{
        message?: unknown;
        aiMessage?: unknown;
    }>({
        action: "post_message",
        thread_id: payload.threadId,
        content: payload.content,
    });

    return {
        message: normalizeClassThreadMessage(result.message),
        aiMessage: result.aiMessage
            ? normalizeClassThreadMessage(result.aiMessage)
            : null,
    };
};

export const sharePrivateChatToClass = async (
    payload: SharePrivateChatPayload,
): Promise<ClassThread> => {
    const result = await invokeClassChat<{ thread?: unknown }>({
        action: "share_private_chat",
        class_id: payload.classId,
        chat_id: payload.chatId,
        message_ids: payload.messageIds ?? [],
    });

    return normalizeClassThread(result.thread);
};

export const shareGradeResultToClass = async (
    payload: ShareGradeResultPayload,
): Promise<ClassThread> => {
    const result = await invokeClassChat<{ thread?: unknown }>({
        action: "share_grade_result",
        class_id: payload.classId,
        grade_payload: payload.gradePayload,
    });

    return normalizeClassThread(result.thread);
};
