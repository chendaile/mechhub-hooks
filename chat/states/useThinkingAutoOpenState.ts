import { useEffect, useRef, useState } from "react";
import type { Message } from "../types";

interface UseThinkingAutoOpenStateParams {
    messages: Message[];
    isTyping: boolean;
    sessionId: string | null;
    scrollToBottom: (behavior?: ScrollBehavior) => void;
}

export const useThinkingAutoOpenState = ({
    messages,
    isTyping,
    sessionId,
    scrollToBottom,
}: UseThinkingAutoOpenStateParams) => {
    const [autoOpenThinkingMessageId, setAutoOpenThinkingMessageId] = useState<
        string | null
    >(null);
    const previousSessionIdRef = useRef<string | null>(null);
    const previousAutoOpenMessageIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (sessionId === previousSessionIdRef.current) {
            return;
        }

        previousSessionIdRef.current = sessionId;
        setAutoOpenThinkingMessageId(null);
        previousAutoOpenMessageIdRef.current = null;
    }, [sessionId]);

    useEffect(() => {
        if (!isTyping || messages.length === 0) {
            return;
        }

        let lastAssistantStudyMessageId: string | null = null;
        for (let index = messages.length - 1; index >= 0; index -= 1) {
            const message = messages[index];
            if (message.role === "assistant" && message.mode === "study") {
                lastAssistantStudyMessageId = message.id;
                break;
            }
        }

        if (!lastAssistantStudyMessageId) {
            return;
        }

        if (
            lastAssistantStudyMessageId === previousAutoOpenMessageIdRef.current
        ) {
            return;
        }

        previousAutoOpenMessageIdRef.current = lastAssistantStudyMessageId;
        setAutoOpenThinkingMessageId(lastAssistantStudyMessageId);
        scrollToBottom("smooth");
    }, [isTyping, messages, scrollToBottom]);

    return {
        state: {
            autoOpenThinkingMessageId,
        },
    };
};
