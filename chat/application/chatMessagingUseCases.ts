import type { Message, SubmitMessage } from "../types/message";
import { runCorrectPipeline, runStudyPipeline } from "./chatMessagePipelineUseCases";
import { isSubmitMessageEmpty } from "./chatMessagePolicies";
import {
    generateAndPersistTitle,
    persistSession,
    prepareActiveSession,
    upsertAssistantMessage,
} from "./chatSessionUseCases";
import type { AIGatewayPort } from "./ports/AIGatewayPort";
import type { ChatCachePort } from "./ports/ChatCachePort";

interface CreateChatMessagingUseCasesParams {
    cache: ChatCachePort;
    aiGateway: AIGatewayPort;
}

export const createChatMessagingUseCases = ({
    cache,
    aiGateway,
}: CreateChatMessagingUseCasesParams) => ({
    isSubmitMessageEmpty,
    prepareActiveSession: (params: {
        currentSessionId: string | null;
        setCurrentSessionId: (id: string | null) => void;
        setSessionTyping: (id: string, isTyping: boolean) => void;
        newMessage: Message;
        text: string;
    }) =>
        prepareActiveSession({
            cache,
            ...params,
        }),
    runAssistantPipeline: (params: {
        activeId: string;
        submitMessage: SubmitMessage;
        signal?: AbortSignal;
    }) =>
        params.submitMessage.mode === "study"
            ? runStudyPipeline({
                  cache,
                  aiGateway,
                  activeId: params.activeId,
                  submitMessage: params.submitMessage,
                  signal: params.signal,
              })
            : runCorrectPipeline({
                  cache,
                  aiGateway,
                  activeId: params.activeId,
                  submitMessage: params.submitMessage,
              }),
    upsertAssistantMessage: (
        sessionId: string,
        mode: SubmitMessage["mode"],
        aiResponse: Message,
    ) => upsertAssistantMessage(cache, sessionId, mode, aiResponse),
    persistSession: (
        activeId: string,
        title: string,
        saveChat: (payload: {
            id: string;
            messages: Message[];
            title: string;
        }) => Promise<unknown>,
    ) => persistSession(cache, activeId, title, saveChat),
    generateAndPersistTitle: (
        activeId: string,
        finalMessages: Message[],
        generateTitle: (messages: Message[]) => Promise<string>,
        saveChat: (payload: {
            id: string;
            messages: Message[];
            title: string;
        }) => Promise<unknown>,
    ) =>
        generateAndPersistTitle(
            cache,
            activeId,
            finalMessages,
            generateTitle,
            saveChat,
        ),
    removeSession: (sessionId: string) => cache.removeChatSession(sessionId),
});

export type ChatMessagingUseCases = ReturnType<
    typeof createChatMessagingUseCases
>;

