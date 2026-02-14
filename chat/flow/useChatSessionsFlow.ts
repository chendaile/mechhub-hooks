import type { Session } from "@supabase/supabase-js";
import type { DeleteChatResult } from "../types";
import { useChatSessionsData } from "./useChatSessionsData";
import { useChatModeState } from "../ui/useChatModeState";
import { useSessionSelectionState } from "../ui/useSessionSelectionState";

export const useChatSessionsFlow = (
    session: Session | null,
    isEnabled = true,
) => {
    const viewerUserId = session?.user.id ?? null;

    const {
        chatSessions,
        isLoadingSessions,
        deleteChatSession: deleteChatSessionData,
        handleRenameSession,
    } = useChatSessionsData(session, isEnabled);

    const {
        currentSessionId,
        setCurrentSessionId,
        messages,
        handleSelectSession,
        handleStartNewQuest: handleStartNewQuestSession,
        handleClearCurrentSessionSelection,
    } = useSessionSelectionState({ chatSessions, viewerUserId });

    const { chatMode, setChatMode, resetChatMode } = useChatModeState();

    const handleStartNewQuest = () => {
        if (!isEnabled) {
            return;
        }

        handleStartNewQuestSession();
        resetChatMode();
    };

    const deleteChatSession = async (id: string): Promise<DeleteChatResult> => {
        if (!isEnabled) {
            return { success: false, wasCurrentSession: false };
        }

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
        handleClearCurrentSessionSelection,
        deleteChatSession,
        handleRenameSession,
    };
};
