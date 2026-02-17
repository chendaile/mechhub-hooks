import type {
    AICompletionRequest,
    AICompletionResponse,
    GradingResult,
    Message,
    OcrResult,
} from "../types";

export interface AIGatewayPort {
    getResponseStream(
        request: AICompletionRequest,
        onChunk: (chunk: {
            type: "content" | "reasoning";
            content: string;
        }) => void,
        abortSignal?: AbortSignal,
    ): Promise<AICompletionResponse>;
    getOcrResult(imageUrls: string[]): Promise<OcrResult[]>;
    parseGradingResult(
        aiReply: string,
        userImageUrls: string[],
    ): GradingResult | undefined;
    generateTitle(messages: Message[]): Promise<string>;
}
