import { useRef, useState } from "react";

export const useChatSubmissionGuardState = () => {
    const [typingSessionIds, setTypingSessionIds] = useState<Set<string>>(
        new Set(),
    );

    const abortControllersRef = useRef(new Map<string, AbortController>());
    const submittingSessionIdsRef = useRef(new Set<string>());
    const isSubmittingNewChatRef = useRef(false);

    const setSessionTyping = (sessionId: string, isTyping: boolean) => {
        setTypingSessionIds((previous) => {
            const next = new Set(previous);
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
        if (isNewChat) {
            return !isSubmittingNewChatRef.current;
        }

        if (!sessionId) {
            return false;
        }

        return !submittingSessionIdsRef.current.has(sessionId);
    };

    const markSubmitting = (sessionId: string, isNewChat: boolean) => {
        submittingSessionIdsRef.current.add(sessionId);
        if (isNewChat) {
            isSubmittingNewChatRef.current = true;
        }
    };

    const resetSubmissionState = (sessionId: string, isNewChat: boolean) => {
        setSessionTyping(sessionId, false);
        abortControllersRef.current.delete(sessionId);
        submittingSessionIdsRef.current.delete(sessionId);
        if (isNewChat) {
            isSubmittingNewChatRef.current = false;
        }
    };

    const clearNewChatSubmitting = () => {
        isSubmittingNewChatRef.current = false;
    };

    return {
        state: {
            typingSessionIds,
        },
        actions: {
            setSessionTyping,
            registerAbortController,
            getAbortController,
            canSubmit,
            markSubmitting,
            resetSubmissionState,
            clearNewChatSubmitting,
        },
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
