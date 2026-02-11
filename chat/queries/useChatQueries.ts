import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Message, ChatSession } from "../types";
import { chatUseCases } from "../interface/chatUseCases";
import {
    mergeChatSessions,
    removeChatSession,
    updateChatTitle,
    upsertSavedChatSession,
} from "./chatCache";
import { chatKeys } from "./chatKeys";

export const useChats = (enabled = true) => {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: chatKeys.lists(),
        queryFn: chatUseCases.chatQueryUseCases.fetchChats,
        enabled,
        select: (remoteChats) =>
            mergeChatSessions(
                queryClient.getQueryData<ChatSession[]>(chatKeys.lists()) || [],
                remoteChats || [],
            ),
    });
};

export const useSaveChat = () => {
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
            return chatUseCases.chatQueryUseCases.saveChat(id, messages, title);
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

export const useDeleteChat = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: chatUseCases.chatQueryUseCases.deleteChat,
        onSuccess: async (_, deletedId) => {
            removeChatSession(queryClient, deletedId);
            await queryClient.invalidateQueries({
                queryKey: chatKeys.lists(),
            });
        },
    });
};

export const useRenameChat = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            newTitle,
        }: {
            id: string;
            newTitle: string;
        }) => {
            return chatUseCases.chatQueryUseCases.renameChat(id, newTitle);
        },
        onSuccess: async (_, { id, newTitle }) => {
            updateChatTitle(queryClient, id, newTitle);
            await queryClient.invalidateQueries({
                queryKey: chatKeys.lists(),
            });
        },
    });
};

export const useGenerateTitle = () => {
    return useMutation({
        mutationFn: async (messages: Message[]) => {
            return chatUseCases.chatQueryUseCases.generateTitle(messages);
        },
    });
};
