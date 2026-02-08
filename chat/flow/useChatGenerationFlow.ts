import { useRef, useState } from "react";

export const useChatGenerationFlow = () => {
    const [typingSessionIds, setTypingSessionIds] = useState<Set<string>>(
        new Set(),
    );

    const abortControllersRef = useRef(new Map<string, AbortController>());
    const isSubmittingRef = useRef(new Set<string>());
    const isSubmittingNewChatRef = useRef(false);

    const setSessionTyping = (sessionId: string, isTyping: boolean) => {
        setTypingSessionIds((prev) => {
            const next = new Set(prev);
            if (isTyping) {
                next.add(sessionId);
            } else {
                next.delete(sessionId);
            }
            return next;
        });
    };

    const registerAbortController = (
        sessionId: string,
        controller: AbortController,
    ) => {
        abortControllersRef.current.set(sessionId, controller);
    };

    const getAbortController = (sessionId: string) =>
        abortControllersRef.current.get(sessionId) || null;

    const canSubmit = (sessionId: string | null, isNewChat: boolean) => {
        if (isNewChat) return !isSubmittingNewChatRef.current;
        if (!sessionId) return false;
        return !isSubmittingRef.current.has(sessionId);
    };

    const markSubmitting = (sessionId: string, isNewChat: boolean) => {
        isSubmittingRef.current.add(sessionId);
        if (isNewChat) {
            isSubmittingNewChatRef.current = true;
        }
    };

    const resetSubmissionState = (sessionId: string, isNewChat: boolean) => {
        setSessionTyping(sessionId, false);
        abortControllersRef.current.delete(sessionId);
        isSubmittingRef.current.delete(sessionId);
        if (isNewChat) {
            isSubmittingNewChatRef.current = false;
        }
    };

    const clearNewChatSubmitting = () => {
        isSubmittingNewChatRef.current = false;
    };

    return {
        typingSessionIds,
        setSessionTyping,
        registerAbortController,
        getAbortController,
        canSubmit,
        markSubmitting,
        resetSubmissionState,
        clearNewChatSubmitting,
    };
};
