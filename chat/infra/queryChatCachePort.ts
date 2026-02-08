import type { QueryClient } from "@tanstack/react-query";
import type { ChatCachePort } from "../application/ports/ChatCachePort";
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
): ChatCachePort => ({
    findChatById: (sessionId) => findChatById(queryClient, sessionId),
    prependChatSession: (session) => prependChatSession(queryClient, session),
    removeChatSession: (sessionId) => removeChatSession(queryClient, sessionId),
    updateChatTitle: (sessionId, title) =>
        updateChatTitle(queryClient, sessionId, title),
    setChatTitleGenerating: (sessionId, isGeneratingTitle) =>
        setChatTitleGenerating(queryClient, sessionId, isGeneratingTitle),
    updateChatMessages: (sessionId, updater) =>
        updateChatMessages(queryClient, sessionId, updater),
});
