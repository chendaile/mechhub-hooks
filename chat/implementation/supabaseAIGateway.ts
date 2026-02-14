import type {
    AICompletionRequest,
    AICompletionResponse,
    GradingResult,
    Message,
} from "../types";
import {
    generateTitle,
    getResponse,
    getResponseStream,
    parseGradingResult,
} from "../services/ai/supabaseAIGatewayService";

export class SupabaseAIGateway {
    static async getResponse(
        request: AICompletionRequest,
    ): Promise<AICompletionResponse> {
        return getResponse(request);
    }

    static async getResponseStream(
        request: AICompletionRequest,
        onChunk: (chunk: {
            type: "content" | "reasoning";
            content: string;
        }) => void,
        abortSignal?: AbortSignal,
    ): Promise<AICompletionResponse> {
        return getResponseStream(request, onChunk, abortSignal);
    }

    static parseGradingResult(
        aiReply: string,
        userImageUrls: string[],
    ): GradingResult | undefined {
        return parseGradingResult(aiReply, userImageUrls);
    }

    static async generateTitle(messages: Message[]): Promise<string> {
        return generateTitle(messages);
    }
}
