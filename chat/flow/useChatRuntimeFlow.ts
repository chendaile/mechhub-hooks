import { useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSessionQuery } from "../../auth/queries/useSession";
import { createChatMessagingUseCases } from "../interface/chatMessagingUseCases";
import { chatDomainInterface } from "../interface/ChatDomainInterface";
import {
    useGenerateTitleMutation,
    useSaveChatMutation,
} from "../queries/useChatQueries";
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
    const { data: session } = useSessionQuery();
    const viewerUserId = session?.user.id ?? null;
    const saveChatMutation = useSaveChatMutation();
    const generateTitleMutation = useGenerateTitleMutation();
    const currentSessionIdRef = useRef<string | null>(null);

    const chatMessagingUseCases = useMemo(() => {
        const cache = chatDomainInterface.createChatCachePort(
            queryClient,
            viewerUserId,
        );
        return createChatMessagingUseCases({
            cache,
            aiGateway: chatDomainInterface.aiGateway,
        });
    }, [queryClient, viewerUserId]);

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
