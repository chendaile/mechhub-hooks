import { createChatQueryUseCases } from "../application/createChatQueryUseCases";
import { createQueryChatCachePort } from "../infra/queryChatCachePort";
import { createSupabaseAIGateway } from "../infra/supabaseAIGatewayAdapter";
import { createSupabaseChatRepository } from "../infra/supabaseChatRepository";
import { createSupabaseStoragePort } from "../infra/supabaseStoragePort";
import type { ChatWiring } from "./chatWiring";

export const createDefaultChatWiring = (): ChatWiring => {
    const chatRepository = createSupabaseChatRepository();
    const aiGateway = createSupabaseAIGateway();
    const storagePort = createSupabaseStoragePort();

    return {
        chatQueryUseCases: createChatQueryUseCases(chatRepository, aiGateway),
        aiGateway,
        storagePort,
        createChatCachePort: (queryClient) => createQueryChatCachePort(queryClient),
    };
};
