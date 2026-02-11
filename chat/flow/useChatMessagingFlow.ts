import type { RefObject } from "react";
import type { Message, SubmitMessage } from "../types";
import type { ChatMessagingUseCases } from "../interface/chatMessagingUseCases";
import { useChatGenerationFlow } from "./useChatGenerationFlow";

const createUserMessage = (submitMessage: SubmitMessage): Message => ({
    ...submitMessage,
    id: Date.now().toString(),
    role: "user",
    type: "text",
    createdAt: new Date().toISOString(),
});

interface UseChatMessagingParams {
    currentSessionId: string | null;
    currentSessionIdRef: RefObject<string | null>;
    setCurrentSessionId: (id: string | null) => void;
    chatMessagingUseCases: ChatMessagingUseCases;
    saveChat: (payload: {
        id: string;
        messages: Message[];
        title: string;
    }) => Promise<unknown>;
    generateTitle: (messages: Message[]) => Promise<string>;
}

export const useChatMessagingFlow = ({
    currentSessionId,
    currentSessionIdRef,
    setCurrentSessionId,
    chatMessagingUseCases,
    saveChat,
    generateTitle,
}: UseChatMessagingParams) => {
    const {
        typingSessionIds,
        setSessionTyping,
        registerAbortController,
        getAbortController,
        canSubmit,
        markSubmitting,
        resetSubmissionState,
        clearNewChatSubmitting,
    } = useChatGenerationFlow();

    const handleStopGeneration = () => {
        const sessionId = currentSessionIdRef.current;
        if (!sessionId) return;

        const controller = getAbortController(sessionId);
        if (controller) {
            controller.abort();
            resetSubmissionState(sessionId, false);
            clearNewChatSubmitting();
        }
    };

    const handleSendMessage = async (
        submitMessage: SubmitMessage,
        switchToChatView?: () => void,
    ) => {
        const { text } = submitMessage;
        if (chatMessagingUseCases.isSubmitMessageEmpty(submitMessage)) return;

        if (!canSubmit(currentSessionId, !currentSessionId)) return;
        if (switchToChatView) switchToChatView();

        const newMessage = createUserMessage(submitMessage);
        const { activeId, isNewChat, chatTitle } =
            chatMessagingUseCases.prepareActiveSession({
                currentSessionId,
                setCurrentSessionId,
                setSessionTyping,
                newMessage,
                text,
            });

        if (!canSubmit(activeId, isNewChat)) return;
        markSubmitting(activeId, isNewChat);

        try {
            const controller = new AbortController();
            registerAbortController(activeId, controller);
            const aiResponse = await chatMessagingUseCases.runAssistantPipeline(
                {
                    activeId,
                    submitMessage,
                    signal: controller.signal,
                },
            );

            chatMessagingUseCases.upsertAssistantMessage(
                activeId,
                submitMessage.mode,
                aiResponse,
            );
            resetSubmissionState(activeId, isNewChat);

            const finalMessages = await chatMessagingUseCases.persistSession(
                activeId,
                chatTitle,
                saveChat,
            );
            if (isNewChat) {
                await chatMessagingUseCases.generateAndPersistTitle(
                    activeId,
                    finalMessages,
                    generateTitle,
                    saveChat,
                );
            }
        } catch (error) {
            console.error("AI response failed", error);

            if (isNewChat) {
                chatMessagingUseCases.removeSession(activeId);
                setCurrentSessionId(null);
            }

            resetSubmissionState(activeId, isNewChat);
        }
    };

    return {
        typingSessionIds,
        handleSendMessage,
        handleStopGeneration,
    };
};
