import type { QueryClient } from "@tanstack/react-query";
import { createSupabaseAIGateway } from "../implementation/supabaseAIGatewayPort";
import { createQueryChatCachePort } from "../implementation/queryChatCachePort";
import { createSupabaseChatRepository } from "../implementation/supabaseChatRepository";
import { createSupabaseStoragePort } from "../implementation/supabaseStoragePort";
import type { ChatCachePort } from "./ChatCachePort";
import { createChatQueryUseCases } from "./createChatQueryUseCases";
import type { ChatQueryUseCases } from "./ChatQueryUseCases";
import type { AIGatewayPort } from "./AIGatewayPort";
import type { StoragePort } from "./StoragePort";

export interface ChatDomainInterface {
    chatQueryUseCases: ChatQueryUseCases;
    aiGateway: AIGatewayPort;
    storagePort: StoragePort;
    createChatCachePort(
        queryClient: QueryClient,
        viewerUserId: string | null | undefined,
    ): ChatCachePort;
}

export const createChatDomainInterface = (): ChatDomainInterface => {
    const chatRepository = createSupabaseChatRepository();
    const aiGateway = createSupabaseAIGateway();
    const storagePort = createSupabaseStoragePort();

    return {
        chatQueryUseCases: createChatQueryUseCases(chatRepository, aiGateway),
        aiGateway,
        storagePort,
        createChatCachePort: (queryClient, viewerUserId) =>
            createQueryChatCachePort(queryClient, viewerUserId),
    };
};

export const chatDomainInterface = createChatDomainInterface();
