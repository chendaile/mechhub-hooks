import type { Session } from "@supabase/supabase-js";
import type { DeleteChatResult } from "../types";
import { useChatSessionsData } from "./useChatSessionsData";
import { useChatModeState } from "../ui/useChatModeState";
import { useSessionSelectionState } from "../ui/useSessionSelectionState";

export const useChatSessionsFlow = (session: Session | null) => {
    const {
        chatSessions,
        isLoadingSessions,
        deleteChatSession: deleteChatSessionData,
        handleRenameSession,
    } = useChatSessionsData(session);

    const {
        currentSessionId,
        setCurrentSessionId,
        messages,
        handleSelectSession,
        handleStartNewQuest: handleStartNewQuestSession,
    } = useSessionSelectionState({ chatSessions });

    const { chatMode, setChatMode, resetChatMode } = useChatModeState();

    const handleStartNewQuest = () => {
        handleStartNewQuestSession();
        resetChatMode();
    };

    const deleteChatSession = async (id: string): Promise<DeleteChatResult> => {
        const result = await deleteChatSessionData(id);
        const wasCurrentSession = currentSessionId === id;
        if (result.success && wasCurrentSession) {
            handleStartNewQuest();
        }
        return { success: result.success, wasCurrentSession };
    };

    return {
        chatSessions,
        isLoadingSessions,
        currentSessionId,
        setCurrentSessionId,
        messages,
        chatMode,
        setChatMode,
        handleSelectSession,
        handleStartNewQuest,
        deleteChatSession,
        handleRenameSession,
    };
};
