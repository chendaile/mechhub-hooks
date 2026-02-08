import type { AIGatewayPort } from "../application/ports/AIGatewayPort";
import { SupabaseAIGateway } from "./supabaseAIGateway";

export const createSupabaseAIGateway = (): AIGatewayPort => ({
    getResponseStream: (request, onChunk, signal) =>
        SupabaseAIGateway.getResponseStream(request, onChunk, signal),
    parseGradingResult: (aiReply, userImageUrls) =>
        SupabaseAIGateway.parseGradingResult(aiReply, userImageUrls),
    generateTitle: (messages) => SupabaseAIGateway.generateTitle(messages),
});
