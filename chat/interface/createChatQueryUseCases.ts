import type { Message } from "../types";
import type { AIGatewayPort } from "./AIGatewayPort";
import type { ChatRepositoryPort } from "./ChatRepositoryPort";
import type { ChatQueryUseCases } from "./ChatQueryUseCases";

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
