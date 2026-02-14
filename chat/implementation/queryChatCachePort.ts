import type { QueryClient } from "@tanstack/react-query";
import type { ChatCachePort } from "../interface/ChatCachePort";
import {
    findChatById,
    prependChatSession,
    removeChatSession,
    setChatTitleGenerating,
    updateChatMessages,
    updateChatTitle,
} from "../queries/chatCache";

export const createQueryChatCachePort = (
    queryClient: QueryClient,
    viewerUserId: string | null | undefined,
): ChatCachePort => ({
    findChatById: (sessionId) =>
        findChatById(queryClient, viewerUserId, sessionId),
    prependChatSession: (session) =>
        prependChatSession(queryClient, viewerUserId, session),
    removeChatSession: (sessionId) =>
        removeChatSession(queryClient, viewerUserId, sessionId),
    updateChatTitle: (sessionId, title) =>
        updateChatTitle(queryClient, viewerUserId, sessionId, title),
    setChatTitleGenerating: (sessionId, isGeneratingTitle) =>
        setChatTitleGenerating(
            queryClient,
            viewerUserId,
            sessionId,
            isGeneratingTitle,
        ),
    updateChatMessages: (sessionId, updater) =>
        updateChatMessages(queryClient, viewerUserId, sessionId, updater),
});
