import { supabase } from "../../../shared/supabase";
import type {
    AICompletionRequest,
    AICompletionResponse,
    Message,
} from "../../types";
import {
    mapMessagesToApiPayload,
    getLatestUserImageUrls,
} from "./aiMessageMapper";
import { buildSystemPrompt, isThinkingModel } from "./aiPromptBuilder";
import { parseGradingResult } from "./aiResponseParser";
import { streamChatResponse } from "./aiStreamClient";
import {
    generateTitle as generateTitleFromService,
    type AILogger,
} from "./aiTitleService";

const createPayloadMessages = (request: AICompletionRequest) => {
    const userImageUrls = getLatestUserImageUrls(request.messages);
    const systemPrompt = buildSystemPrompt(request.mode, userImageUrls);
    const apiMessages = mapMessagesToApiPayload(request.messages);

    return {
        userImageUrls,
        payloadMessages: [
            {
                role: "system",
                content: systemPrompt,
            },
            ...apiMessages,
        ],
    };
};

export const getResponse = async (
    request: AICompletionRequest,
): Promise<AICompletionResponse> => {
    const { userImageUrls, payloadMessages } = createPayloadMessages(request);
    const enableThinking = isThinkingModel(request.model);
    const includeReasoning = enableThinking;

    const { data, error } = await supabase.functions.invoke("chat-response", {
        body: {
            messages: payloadMessages,
            model: request.model,
            enableThinking,
            includeReasoning,
        },
    });

    if (error) {
        throw new Error("AI 服务暂时不可用，请稍后再试。");
    }

    const responseData = (data ?? {}) as {
        reply?: unknown;
        reasoning?: unknown;
    };

    const aiReply =
        typeof responseData.reply === "string"
            ? responseData.reply
            : "AI 没有返回内容。";
    const aiReasoning =
        typeof responseData.reasoning === "string"
            ? responseData.reasoning
            : "";

    if (request.mode === "correct") {
        const gradingResult = parseGradingResult(aiReply, userImageUrls);
        if (gradingResult) {
            return {
                text: aiReply,
                gradingResult,
                reasoning: aiReasoning,
            };
        }
    }

    return {
        text: aiReply,
        reasoning: aiReasoning,
    };
};

export const getResponseStream = async (
    request: AICompletionRequest,
    onChunk: (chunk: {
        type: "content" | "reasoning";
        content: string;
    }) => void,
    abortSignal?: AbortSignal,
): Promise<AICompletionResponse> => {
    const { payloadMessages } = createPayloadMessages(request);
    const enableThinking = isThinkingModel(request.model);
    const includeReasoning = enableThinking;

    return streamChatResponse(
        {
            messages: payloadMessages,
            model: request.model,
            enableThinking,
            includeReasoning,
        },
        onChunk,
        abortSignal,
    );
};

export const generateTitle = async (
    messages: Message[],
    logger?: AILogger,
): Promise<string> => generateTitleFromService(messages, logger);

export { parseGradingResult };
