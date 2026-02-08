import { useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import type { AIGatewayPort } from "../application/ports/AIGatewayPort";
import type { ChatCachePort } from "../application/ports/ChatCachePort";
import type { ChatQueryUseCases } from "../application/useCases/ChatQueryUseCases";
import { createChatMessagingUseCases } from "../application/chatMessagingUseCases";
import { useGenerateTitle, useSaveChat } from "../queries/useChatQueries";
import { useChatMessagingFlow } from "./useChatMessagingFlow";

interface UseChatRuntimeFlowParams {
    currentSessionId: string | null;
    setCurrentSessionId: (id: string | null) => void;
    chatQueryUseCases: ChatQueryUseCases;
    aiGateway: AIGatewayPort;
    createChatCachePort: (queryClient: QueryClient) => ChatCachePort;
}

export const useChatRuntimeFlow = ({
    currentSessionId,
    setCurrentSessionId,
    chatQueryUseCases,
    aiGateway,
    createChatCachePort,
}: UseChatRuntimeFlowParams) => {
    const queryClient = useQueryClient();
    const saveChatMutation = useSaveChat(chatQueryUseCases);
    const generateTitleMutation = useGenerateTitle(chatQueryUseCases);
    const currentSessionIdRef = useRef<string | null>(null);

    const chatMessagingUseCases = useMemo(() => {
        const cache = createChatCachePort(queryClient);
        return createChatMessagingUseCases({ cache, aiGateway });
    }, [aiGateway, createChatCachePort, queryClient]);

    useEffect(() => {
        currentSessionIdRef.current = currentSessionId;
    }, [currentSessionId]);

    const { typingSessionIds, handleSendMessage, handleStopGeneration } =
        useChatMessagingFlow({
            currentSessionId,
            currentSessionIdRef,
            setCurrentSessionId,
            chatMessagingUseCases,
            saveChat: (payload) => saveChatMutation.mutateAsync(payload),
            generateTitle: (messages) =>
                generateTitleMutation.mutateAsync(messages),
        });

    return {
        isTyping: !!currentSessionId && typingSessionIds.has(currentSessionId),
        handleSendMessage,
        handleStopGeneration,
    };
};
