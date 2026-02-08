import type { Session } from "@supabase/supabase-js";
import type { ChatQueryUseCases } from "../application/useCases/ChatQueryUseCases";
import type { DeleteChatResult } from "../types/message";
import { useChatSessionsData } from "./useChatSessionsData";
import { useChatModeState } from "../state/useChatModeState";
import { useSessionSelectionState } from "../state/useSessionSelectionState";

export const useChatSessionsFlow = (
    session: Session | null,
    chatQueryUseCases: ChatQueryUseCases,
) => {
    const {
        chatSessions,
        isLoadingSessions,
        deleteChatSession: deleteChatSessionData,
        handleRenameSession,
    } = useChatSessionsData(session, chatQueryUseCases);

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
