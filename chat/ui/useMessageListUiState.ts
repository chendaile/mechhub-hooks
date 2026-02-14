import type { Message } from "../types";
import { useImagePreviewState } from "./useImagePreviewState";
import { useAutoScrollState } from "../states/useAutoScrollState";
import { useThinkingAutoOpenState } from "../states/useThinkingAutoOpenState";
import { useTypingNotificationState } from "../states/useTypingNotificationState";

interface UseMessageListUiStateProps {
    messages: Message[];
    isTyping: boolean;
    sessionId: string | null;
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

    return {
        contentRef: autoScrollState.state.contentRef,
        messagesEndRef: autoScrollState.state.messagesEndRef,
        previewImage,
        openPreview,
        closePreview,
        handleScroll: typingNotificationState.actions.handleScroll,
        autoOpenThinkingMessageId:
            thinkingAutoOpenState.state.autoOpenThinkingMessageId,
    };
};
