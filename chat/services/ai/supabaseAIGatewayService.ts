import { supabase } from "../../../shared/supabase";
import type {
    AICompletionRequest,
    AICompletionResponse,
    Message,
    OcrResult,
} from "../../types";
import {
    mapMessagesToApiPayload,
    getLatestUserImageUrls,
} from "./aiMessageMapper";
import { isThinkingModel } from "./aiPromptBuilder";
import { parseGradingResult } from "./aiResponseParser";
import { streamChatResponse } from "./aiStreamClient";
import {
    generateTitle as generateTitleFromService,
    type AILogger,
} from "./aiTitleService";

const DEFAULT_OCR_PROMPT =
    "grounding mode,document to markdown,like this'<|ref|>text<|/ref|><|det|>[[90, 272, 240, 302]]<|/det|>'";

const createPayloadMessages = (request: AICompletionRequest) => {
    const userImageUrls = getLatestUserImageUrls(request.messages);
    const apiMessages = mapMessagesToApiPayload(request.messages);

    return {
        userImageUrls,
        payloadMessages: apiMessages,
    };
};

export const getOcrResult = async (
    imageUrls: string[],
): Promise<OcrResult[]> => {
    if (!imageUrls || imageUrls.length === 0) {
        return [];
    }

    const { data, error } = await supabase.functions.invoke("ocr-response", {
        body: {
            imageUrls,
            prompt: DEFAULT_OCR_PROMPT,
        },
    });

    if (error) {
        throw new Error("OCR 服务暂时不可用，请稍后再试。");
    }

    const responseData = (data ?? {}) as {
        results?: Array<{ imageUrl?: unknown; text?: unknown }>;
    };

    const results = Array.isArray(responseData.results)
        ? responseData.results
              .map((item) => ({
                  imageUrl:
                      typeof item.imageUrl === "string" ? item.imageUrl : "",
                  text: typeof item.text === "string" ? item.text : "",
              }))
              .filter((item) => item.imageUrl)
        : [];

    return results;
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
            mode: request.mode,
            imageUrls: request.imageUrls,
            ocrText: request.ocrText,
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
            mode: request.mode,
            imageUrls: request.imageUrls,
            ocrText: request.ocrText,
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
