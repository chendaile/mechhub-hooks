import { useState } from "react";
import { ChatSession } from "../types/session";

interface UseSessionSelectionStateParams {
    chatSessions: ChatSession[];
}

export const useSessionSelectionState = ({
    chatSessions,
}: UseSessionSelectionStateParams) => {
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(
        null,
    );

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

    return {
        currentSessionId,
        setCurrentSessionId,
        messages,
        handleSelectSession,
        handleStartNewQuest,
    };
};


