import { useMemo } from "react";
import type { Message } from "../types";
import { useImagePreviewState } from "./useImagePreviewState";
import { useAutoScrollState } from "../states/useAutoScrollState";
import { useThinkingAutoOpenState } from "../states/useThinkingAutoOpenState";
import { useTypingNotificationState } from "../states/useTypingNotificationState";
import { isThinkingModel } from "../services/ai/aiPromptBuilder";

interface UseMessageListUiStateProps {
    messages: Message[];
    isTyping: boolean;
    sessionId: string | null;
}

export interface MessageRenderItem {
    message: Message;
    renderKind: "grading" | "text";
    isGenerating: boolean;
    showThinking: boolean;
    shouldAutoOpenThinking: boolean;
}

export const useMessageListUiState = ({
    messages,
    isTyping,
    sessionId,
}: UseMessageListUiStateProps) => {
    const { previewImage, openPreview, closePreview } = useImagePreviewState();
    const autoScrollState = useAutoScrollState({
        messages,
        sessionId,
    });

    const thinkingAutoOpenState = useThinkingAutoOpenState({
        messages,
        isTyping,
        sessionId,
        scrollToBottom: autoScrollState.actions.scrollToBottom,
    });

    const typingNotificationState = useTypingNotificationState({
        isTyping,
        contentRef: autoScrollState.state.contentRef,
        scrollToBottom: autoScrollState.actions.scrollToBottom,
    });

    const autoOpenThinkingMessageId =
        thinkingAutoOpenState.state.autoOpenThinkingMessageId;

    const messageRenderItems = useMemo<MessageRenderItem[]>(
        () =>
            messages.map((message, index) => {
                const isLastMessage = index === messages.length - 1;
                const isGenerating =
                    isTyping && isLastMessage && message.role === "assistant";
                const shouldAutoOpenThinking =
                    message.id === autoOpenThinkingMessageId &&
                    message.role === "assistant" &&
                    message.mode === "study";
                const modelUsesThinking = isThinkingModel(message.model);

                return {
                    message,
                    renderKind: message.gradingResult ? "grading" : "text",
                    isGenerating,
                    showThinking: message.gradingResult
                        ? modelUsesThinking
                        : message.role === "assistant" && modelUsesThinking,
                    shouldAutoOpenThinking,
                };
            }),
        [autoOpenThinkingMessageId, isTyping, messages],
    );

    return {
        contentRef: autoScrollState.state.contentRef,
        messagesEndRef: autoScrollState.state.messagesEndRef,
        previewImage,
        openPreview,
        closePreview,
        handleScroll: typingNotificationState.actions.handleScroll,
        autoOpenThinkingMessageId,
        messageRenderItems,
    };
};
