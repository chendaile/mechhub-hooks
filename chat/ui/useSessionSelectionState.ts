import { useEffect, useState } from "react";
import { ChatSession } from "../types";

interface UseSessionSelectionStateParams {
    chatSessions: ChatSession[];
    viewerUserId: string | null;
}

export const useSessionSelectionState = ({
    chatSessions,
    viewerUserId,
}: UseSessionSelectionStateParams) => {
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(
        null,
    );

    useEffect(() => {
        setCurrentSessionId(null);
    }, [viewerUserId]);

    useEffect(() => {
        if (!currentSessionId) {
            return;
        }

        const exists = chatSessions.some((chat) => chat.id === currentSessionId);
        if (!exists) {
            setCurrentSessionId(null);
        }
    }, [chatSessions, currentSessionId]);

    const activeSession = chatSessions.find(
        (chat) => chat.id === currentSessionId,
    );
    const messages = activeSession?.messages || [];

    const handleSelectSession = (id: string) => {
        const exists = chatSessions.some((chat) => chat.id === id);
        if (!exists) return false;

        setCurrentSessionId(id);
        return true;
    };

    const handleStartNewQuest = () => {
        setCurrentSessionId(null);
    };

    const handleClearCurrentSessionSelection = () => {
        setCurrentSessionId(null);
    };

    return {
        currentSessionId,
        setCurrentSessionId,
        messages,
        handleSelectSession,
        handleStartNewQuest,
        handleClearCurrentSessionSelection,
    };
};
