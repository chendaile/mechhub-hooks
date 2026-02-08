import { QueryClient } from "@tanstack/react-query";
import { Message } from "../types/message";
import { ChatSession } from "../types/session";
import { chatKeys } from "./chatKeys";

const getChatList = (queryClient: QueryClient): ChatSession[] =>
    queryClient.getQueryData<ChatSession[]>(chatKeys.lists()) || [];

const mergeMessages = (local: Message[], remote: Message[]) => {
    if (!local.length) return remote;
    if (!remote.length) return local;

    const remoteById = new Map(remote.map((message) => [message.id, message]));
    const localById = new Map(local.map((message) => [message.id, message]));
    const merged = remote.map((message) => {
        const localMessage = localById.get(message.id);
        if (!localMessage) return message;

        const remoteTextLen = message.text?.length ?? 0;
        const localTextLen = localMessage.text?.length ?? 0;
        const preferLocal =
            localTextLen > remoteTextLen ||
            (!!localMessage.gradingResult && !message.gradingResult);

        return preferLocal
            ? { ...message, ...localMessage }
            : { ...localMessage, ...message };
    });

    for (const message of local) {
        if (!remoteById.has(message.id)) merged.push(message);
    }

    return merged;
};

export const mergeChatSessions = (
    local: ChatSession[],
    remote: ChatSession[],
): ChatSession[] => {
    if (!local.length) return remote;
    if (!remote.length) return local;

    const localById = new Map(local.map((session) => [session.id, session]));
    const remoteIds = new Set(remote.map((session) => session.id));
    const merged = remote.map((session) => {
        const localSession = localById.get(session.id);
        if (!localSession) return session;

        const mergedMessages = mergeMessages(
            localSession.messages || [],
            session.messages || [],
        );

        return {
            ...session,
            isGeneratingTitle:
                localSession.isGeneratingTitle ?? session.isGeneratingTitle,
            messages: mergedMessages,
            updatedAt:
                Math.max(localSession.updatedAt || 0, session.updatedAt || 0) ||
                session.updatedAt,
        };
    });

    for (const session of local) {
        if (!remoteIds.has(session.id)) merged.push(session);
    }

    return merged.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
};

export const findChatById = (
    queryClient: QueryClient,
    sessionId: string,
): ChatSession | undefined => {
    return getChatList(queryClient).find((session) => session.id === sessionId);
};

export const prependChatSession = (
    queryClient: QueryClient,
    session: ChatSession,
) => {
    queryClient.setQueryData<ChatSession[]>(chatKeys.lists(), (old) => [
        session,
        ...(old || []),
    ]);
};

export const removeChatSession = (
    queryClient: QueryClient,
    sessionId: string,
) => {
    queryClient.setQueryData<ChatSession[]>(
        chatKeys.lists(),
        (old) => old?.filter((session) => session.id !== sessionId) || [],
    );
};

export const upsertSavedChatSession = (
    queryClient: QueryClient,
    savedChat: ChatSession,
) => {
    queryClient.setQueryData<ChatSession[]>(chatKeys.lists(), (old) => {
        if (!old) return [savedChat];

        const filtered = old.filter((session) => session.id !== savedChat.id);
        return [savedChat, ...filtered].sort(
            (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0),
        );
    });
};

export const updateChatTitle = (
    queryClient: QueryClient,
    sessionId: string,
    title: string,
) => {
    queryClient.setQueryData<ChatSession[]>(
        chatKeys.lists(),
        (old) =>
            old?.map((session) =>
                session.id === sessionId ? { ...session, title } : session,
            ) || [],
    );
};

export const setChatTitleGenerating = (
    queryClient: QueryClient,
    sessionId: string,
    isGeneratingTitle: boolean,
) => {
    queryClient.setQueryData<ChatSession[]>(
        chatKeys.lists(),
        (old) =>
            old?.map((session) =>
                session.id === sessionId
                    ? { ...session, isGeneratingTitle }
                    : session,
            ) || [],
    );
};

export const updateChatMessages = (
    queryClient: QueryClient,
    sessionId: string,
    updater: (messages: Message[]) => Message[],
) => {
    queryClient.setQueryData<ChatSession[]>(chatKeys.lists(), (old) => {
        if (!old) return [];

        return old.map((session) => {
            if (session.id !== sessionId) return session;

            return {
                ...session,
                messages: updater(session.messages || []),
                updatedAt: Date.now(),
            };
        });
    });
};

