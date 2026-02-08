import type { Message } from "../types/message";
import type { AIGatewayPort } from "./ports/AIGatewayPort";
import type { ChatRepositoryPort } from "./ports/ChatRepositoryPort";
import type { ChatQueryUseCases } from "./useCases/ChatQueryUseCases";

export const createChatQueryUseCases = (
    chatRepository: ChatRepositoryPort,
    aiGateway: AIGatewayPort,
): ChatQueryUseCases => ({
    fetchChats: () => chatRepository.fetchChats(),
    saveChat: (id: string | null, messages: Message[], title: string) =>
        chatRepository.saveChat(id, messages, title),
    deleteChat: (id: string) => chatRepository.deleteChat(id),
    renameChat: (id: string, newTitle: string) =>
        chatRepository.updateChatTitle(id, newTitle),
    generateTitle: (messages: Message[]) => aiGateway.generateTitle(messages),
});

