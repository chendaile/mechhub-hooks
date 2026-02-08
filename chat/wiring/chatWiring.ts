import type { QueryClient } from "@tanstack/react-query";
import type { ChatCachePort } from "../application/ports/ChatCachePort";
import type { AIGatewayPort } from "../application/ports/AIGatewayPort";
import type { StoragePort } from "../application/ports/StoragePort";
import type { ChatQueryUseCases } from "../application/useCases/ChatQueryUseCases";

export interface ChatWiring {
    chatQueryUseCases: ChatQueryUseCases;
    aiGateway: AIGatewayPort;
    storagePort: StoragePort;
    createChatCachePort(queryClient: QueryClient): ChatCachePort;
}
