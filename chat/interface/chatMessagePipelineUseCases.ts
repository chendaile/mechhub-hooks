import type { Message, SubmitMessage } from "../types";
import type { AIGatewayPort } from "./AIGatewayPort";
import type { ChatCachePort } from "./ChatCachePort";
import { appendMessage, updateMessage } from "./chatSessionUseCases";
import { streamAssistantResponse } from "./chatStreamUseCase";
import { getHooksLogger } from "../../shared/logger";

const createStudyAssistantMessage = (
    submitMessage: SubmitMessage,
    id: string,
): Message => ({
    id,
    role: "assistant",
    type: "text",
    text: "",
    reasoning: "",
    mode: submitMessage.mode,
    model: getDisplayModel(submitMessage.model),
    createdAt: new Date().toISOString(),
});

const buildGradingPlaceholderResult = (
    imageUrls: string[],
    summary: string,
) => ({
    summary,
    imageGradingResult: imageUrls.map((url) => ({
        imageUrl: url,
        steps: [],
    })),
});

const createGradingAssistantMessage = (
    submitMessage: SubmitMessage,
    id: string,
    summary = "批改中...",
): Message => {
    const imageUrls = submitMessage.imageUrls || [];

    return {
        id,
        role: "assistant",
        type: "grading",
        text: "",
        reasoning: "",
        mode: submitMessage.mode,
        model: getDisplayModel(submitMessage.model),
        gradingResult: buildGradingPlaceholderResult(imageUrls, summary),
        createdAt: new Date().toISOString(),
    };
};

const getDisplayModel = (model: string) => {
    if (model.startsWith("gemini-") && !model.includes("thinking")) {
        return `${model}-thinking`;
    }
    return model;
};

interface RunStudyParams {
    cache: ChatCachePort;
    aiGateway: AIGatewayPort;
    activeId: string;
    submitMessage: SubmitMessage;
    signal?: AbortSignal;
}

interface RunCorrectParams {
    cache: ChatCachePort;
    aiGateway: AIGatewayPort;
    activeId: string;
    submitMessage: SubmitMessage;
}

export const runStudyPipeline = async ({
    cache,
    aiGateway,
    activeId,
    submitMessage,
    signal,
}: RunStudyParams): Promise<Message> => {
    const streamingMessageId = (Date.now() + 1).toString();
    const streamingMessage = createStudyAssistantMessage(
        submitMessage,
        streamingMessageId,
    );

    appendMessage(cache, activeId, streamingMessage);

    const currentSession = cache.findChatById(activeId);
    const currentMessagesWithUser =
        currentSession?.messages?.filter(
            (message) => message.id !== streamingMessage.id,
        ) || [];

    const { response } = await streamAssistantResponse({
        aiGateway,
        messages: currentMessagesWithUser,
        submitMessage,
        mode: "study",
        onUpdate: ({ text, reasoning }) => {
            updateMessage(cache, activeId, streamingMessageId, (m) => ({
                ...m,
                text,
                reasoning,
            }));
        },
        signal,
    });

    return {
        id: streamingMessageId,
        role: "assistant",
        type: "text",
        text: response.text,
        reasoning: response.reasoning,
        mode: submitMessage.mode,
        model: getDisplayModel(submitMessage.model),
        createdAt: new Date().toISOString(),
    };
};

export const runCorrectPipeline = async ({
    cache,
    aiGateway,
    activeId,
    submitMessage,
}: RunCorrectParams): Promise<Message> => {
    const logger = getHooksLogger();
    const processingMessageId = (Date.now() + 1).toString();
    const userImageUrls = submitMessage.imageUrls || [];
    const processingMessage = createGradingAssistantMessage(
        submitMessage,
        processingMessageId,
    );

    appendMessage(cache, activeId, processingMessage);

    const currentSession = cache.findChatById(activeId);
    const currentMessagesWithUser = currentSession?.messages || [];
    let ocrText = "";

    if (userImageUrls.length > 0) {
        try {
            const ocrResults = await aiGateway.getOcrResult(userImageUrls);
            if (ocrResults.length > 0) {
                ocrText = ocrResults
                    .map((result, index) => {
                        const header = `图片 ${index + 1}`;
                        const text =
                            typeof result.text === "string" ? result.text : "";
                        return `${header}\n${text}`.trim();
                    })
                    .filter((segment) => segment.length > 0)
                    .join("\n\n");
            }

            if (ocrText) {
                updateMessage(cache, activeId, processingMessageId, (m) => ({
                    ...m,
                    ocrText,
                }));
            }
        } catch (error) {
            logger.error("OCR failed (correct mode)", error);
        }
    }

    try {
        const { response, gradingResult } = await streamAssistantResponse({
            aiGateway,
            messages: currentMessagesWithUser,
            submitMessage,
            mode: "correct",
            ocrText,
            onUpdate: ({ text, reasoning }) => {
                updateMessage(cache, activeId, processingMessageId, (m) => ({
                    ...m,
                    text,
                    reasoning,
                }));
            },
        });

        return {
            id: processingMessageId,
            role: "assistant",
            type: "grading",
            text: response.text,
            reasoning: response.reasoning,
            mode: submitMessage.mode,
            ocrText,
            gradingResult:
                gradingResult ||
                buildGradingPlaceholderResult(
                    userImageUrls,
                    "未能解析批改结果，请查看思考与正文。",
                ),
            model: getDisplayModel(submitMessage.model),
            createdAt: new Date().toISOString(),
        };
    } catch (error) {
        logger.error("AI response failed (correct mode)", error);
        return {
            id: processingMessageId,
            role: "assistant",
            type: "grading",
            text: "",
            reasoning: "",
            mode: submitMessage.mode,
            ocrText,
            gradingResult: buildGradingPlaceholderResult(
                userImageUrls,
                "批改失败，请稍后再试。",
            ),
            model: getDisplayModel(submitMessage.model),
            createdAt: new Date().toISOString(),
        };
    }
};
