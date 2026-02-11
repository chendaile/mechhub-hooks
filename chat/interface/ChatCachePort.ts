import type { Message, ChatSession } from "../types";

export interface ChatCachePort {
    findChatById(sessionId: string): ChatSession | undefined;
    prependChatSession(session: ChatSession): void;
    removeChatSession(sessionId: string): void;
    updateChatTitle(sessionId: string, title: string): void;
    setChatTitleGenerating(sessionId: string, isGeneratingTitle: boolean): void;
    updateChatMessages(
        sessionId: string,
        updater: (messages: Message[]) => Message[],
    ): void;
}

