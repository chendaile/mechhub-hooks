import type { QueryClient } from "@tanstack/react-query";
import { createChatQueryUseCases } from "./createChatQueryUseCases";
import { createSupabaseAIGateway } from "../implementation/supabaseAIGatewayPort";
import { createSupabaseChatRepository } from "../implementation/supabaseChatRepository";
import { createSupabaseStoragePort } from "../implementation/supabaseStoragePort";
import { createQueryChatCachePort } from "../implementation/queryChatCachePort";

const createChatUseCases = () => {
    const chatRepository = createSupabaseChatRepository();
    const aiGateway = createSupabaseAIGateway();
    const storagePort = createSupabaseStoragePort();

    return {
        chatQueryUseCases: createChatQueryUseCases(chatRepository, aiGateway),
        aiGateway,
        storagePort,
        createChatCachePort: (queryClient: QueryClient) =>
            createQueryChatCachePort(queryClient),
    };
};

export const chatUseCases = createChatUseCases();

export type ChatUseCases = ReturnType<typeof createChatUseCases>;
