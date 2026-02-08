import type {
    AICompletionRequest,
    AICompletionResponse,
    GradingResult,
    Message,
} from "../../types/message";

export interface AIGatewayPort {
    getResponseStream(
        request: AICompletionRequest,
        onChunk: (chunk: { type: "content" | "reasoning"; content: string }) => void,
        abortSignal?: AbortSignal,
    ): Promise<AICompletionResponse>;
    parseGradingResult(aiReply: string, userImageUrls: string[]): GradingResult | undefined;
    generateTitle(messages: Message[]): Promise<string>;
}


