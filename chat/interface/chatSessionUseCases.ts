import type { ChatMode, Message, ChatSession } from "../types";
import {
    createChatTitle,
    upsertAssistantMessages,
} from "./chatMessagePolicies";
import type { ChatCachePort } from "./ChatCachePort";

interface PrepareActiveSessionParams {
    cache: ChatCachePort;
    currentSessionId: string | null;
    setCurrentSessionId: (id: string | null) => void;
    setSessionTyping: (id: string, isTyping: boolean) => void;
    newMessage: Message;
    text: string;
}

export const prepareActiveSession = ({
    cache,
    currentSessionId,
    setCurrentSessionId,
    setSessionTyping,
    newMessage,
    text,
}: PrepareActiveSessionParams) => {
    const chatTitle = createChatTitle(text);
    const isNewChat = !currentSessionId;

    if (isNewChat) {
        const tempId = crypto.randomUUID();
        const newSession: ChatSession = {
            id: tempId,
            title: chatTitle,
            messages: [newMessage],
            updatedAt: Date.now(),
            isGeneratingTitle: true,
        };

        setCurrentSessionId(tempId);
        cache.prependChatSession(newSession);
        setSessionTyping(tempId, true);

        return {
            activeId: tempId,
            isNewChat: true,
            chatTitle,
        };
    }

    cache.updateChatMessages(currentSessionId, (msgs) => [...msgs, newMessage]);
    setSessionTyping(currentSessionId, true);

    return {
        activeId: currentSessionId,
        isNewChat: false,
        chatTitle,
    };
};

export const appendMessage = (
    cache: ChatCachePort,
    sessionId: string,
    message: Message,
) => {
    cache.updateChatMessages(sessionId, (msgs) => [...msgs, message]);
};

export const updateMessage = (
    cache: ChatCachePort,
    sessionId: string,
    messageId: string,
    updater: (message: Message) => Message,
) => {
    cache.updateChatMessages(sessionId, (msgs) =>
        msgs.map((message) =>
            message.id === messageId ? updater(message) : message,
        ),
    );
};

export const upsertAssistantMessage = (
    cache: ChatCachePort,
    sessionId: string,
    mode: ChatMode,
    aiResponse: Message,
) => {
    cache.updateChatMessages(sessionId, (msgs) =>
        upsertAssistantMessages(msgs, mode, aiResponse),
    );
};

export const persistSession = async (
    cache: ChatCachePort,
    activeId: string,
    title: string,
    saveChat: (payload: {
        id: string;
        messages: Message[];
        title: string;
    }) => Promise<unknown>,
) => {
    const finalSession = cache.findChatById(activeId);
    const finalMessages = finalSession?.messages || [];

    await saveChat({
        id: activeId,
        messages: finalMessages,
        title: finalSession?.title || title,
    });

    return finalMessages;
};

export const generateAndPersistTitle = async (
    cache: ChatCachePort,
    activeId: string,
    finalMessages: Message[],
    generateTitle: (messages: Message[]) => Promise<string>,
    saveChat: (payload: {
        id: string;
        messages: Message[];
        title: string;
    }) => Promise<unknown>,
) => {
    cache.setChatTitleGenerating(activeId, true);
    try {
        const aiGeneratedTitle = await generateTitle(finalMessages);
        cache.updateChatTitle(activeId, aiGeneratedTitle);

        await saveChat({
            id: activeId,
            messages: finalMessages,
            title: aiGeneratedTitle,
        });
    } catch (titleError) {
        console.error("Failed to generate AI title:", titleError);
    } finally {
        cache.setChatTitleGenerating(activeId, false);
    }
};
