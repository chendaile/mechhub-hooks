import type {
    AICompletionResponse,
    GradingResult,
    Message,
    SubmitMessage,
} from "../types";
import type { AIGatewayPort } from "./AIGatewayPort";

export interface StreamUpdate {
    text: string;
    reasoning: string;
}

export interface StreamResult {
    response: AICompletionResponse;
    streamedText: string;
    streamedReasoning: string;
    gradingResult?: GradingResult;
}

interface StreamOptions {
    aiGateway: AIGatewayPort;
    messages: Message[];
    submitMessage: SubmitMessage;
    mode: "study" | "correct";
    onUpdate: (update: StreamUpdate) => void;
    signal?: AbortSignal;
}

export const streamAssistantResponse = async ({
    aiGateway,
    messages,
    submitMessage,
    mode,
    onUpdate,
    signal,
}: StreamOptions): Promise<StreamResult> => {
    let streamedText = "";
    let streamedReasoning = "";

    const response = await aiGateway.getResponseStream(
        {
            messages,
            mode,
            imageUrls: submitMessage.imageUrls,
            fileAttachments: submitMessage.fileAttachments,
            model: submitMessage.model,
        },
        (chunk) => {
            if (chunk.type === "reasoning") {
                streamedReasoning += chunk.content;
            } else {
                streamedText += chunk.content;
            }
            onUpdate({ text: streamedText, reasoning: streamedReasoning });
        },
        signal,
    );

    const gradingResult =
        mode === "correct"
            ? aiGateway.parseGradingResult(
                  response.text,
                  submitMessage.imageUrls || [],
              )
            : undefined;

    return {
        response,
        streamedText,
        streamedReasoning,
        gradingResult,
    };
};
