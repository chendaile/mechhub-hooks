import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ChatQueryUseCases } from "../application/useCases/ChatQueryUseCases";
import type { Message } from "../types/message";
import type { ChatSession } from "../types/session";
import {
    mergeChatSessions,
    removeChatSession,
    updateChatTitle,
    upsertSavedChatSession,
} from "./chatCache";
import { chatKeys } from "./chatKeys";

export const useChats = (chatQueryUseCases: ChatQueryUseCases, enabled = true) => {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: chatKeys.lists(),
        queryFn: chatQueryUseCases.fetchChats,
        enabled,
        select: (remoteChats) =>
            mergeChatSessions(
                queryClient.getQueryData<ChatSession[]>(chatKeys.lists()) || [],
                remoteChats || [],
            ),
    });
};

export const useSaveChat = (chatQueryUseCases: ChatQueryUseCases) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            messages,
            title,
        }: {
            id: string | null;
            messages: Message[];
            title: string;
        }) => {
            return chatQueryUseCases.saveChat(id, messages, title);
        },
        onSuccess: async (savedChat) => {
            upsertSavedChatSession(queryClient, savedChat);
            await queryClient.invalidateQueries({
                queryKey: chatKeys.lists(),
                refetchType: "inactive",
            });
        },
    });
};

export const useDeleteChat = (chatQueryUseCases: ChatQueryUseCases) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: chatQueryUseCases.deleteChat,
        onSuccess: async (_, deletedId) => {
            removeChatSession(queryClient, deletedId);
            await queryClient.invalidateQueries({
                queryKey: chatKeys.lists(),
            });
        },
    });
};

export const useRenameChat = (chatQueryUseCases: ChatQueryUseCases) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            newTitle,
        }: {
            id: string;
            newTitle: string;
        }) => {
            return chatQueryUseCases.renameChat(id, newTitle);
        },
        onSuccess: async (_, { id, newTitle }) => {
            updateChatTitle(queryClient, id, newTitle);
            await queryClient.invalidateQueries({
                queryKey: chatKeys.lists(),
            });
        },
    });
};

export const useGenerateTitle = (chatQueryUseCases: ChatQueryUseCases) => {
    return useMutation({
        mutationFn: async (messages: Message[]) => {
            return chatQueryUseCases.generateTitle(messages);
        },
    });
};

