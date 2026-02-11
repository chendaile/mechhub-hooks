import { useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createChatMessagingUseCases } from "../interface/chatMessagingUseCases";
import { chatUseCases } from "../interface/chatUseCases";
import { useGenerateTitle, useSaveChat } from "../queries/useChatQueries";
import { useChatMessagingFlow } from "./useChatMessagingFlow";

interface UseChatRuntimeFlowParams {
    currentSessionId: string | null;
    setCurrentSessionId: (id: string | null) => void;
}

export const useChatRuntimeFlow = ({
    currentSessionId,
    setCurrentSessionId,
}: UseChatRuntimeFlowParams) => {
    const queryClient = useQueryClient();
    const saveChatMutation = useSaveChat();
    const generateTitleMutation = useGenerateTitle();
    const currentSessionIdRef = useRef<string | null>(null);

    const chatMessagingUseCases = useMemo(() => {
        const cache = chatUseCases.createChatCachePort(queryClient);
        return createChatMessagingUseCases({
            cache,
            aiGateway: chatUseCases.aiGateway,
        });
    }, [queryClient]);

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
