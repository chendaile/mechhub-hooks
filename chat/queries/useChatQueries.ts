import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Message, ChatSession } from "../types";
import { chatDomainInterface } from "../interface/ChatDomainInterface";
import { useSessionQuery } from "../../auth/queries/useSession";
import {
    mergeChatSessions,
    removeChatSession,
    updateChatTitle,
    upsertSavedChatSession,
} from "./chatCache";
import { chatKeys } from "./chatKeys";

export const useChatsQuery = (enabled = true) => {
    const queryClient = useQueryClient();
    const { data: session } = useSessionQuery();
    const viewerUserId = session?.user.id ?? null;

    return useQuery({
        queryKey: chatKeys.lists(viewerUserId),
        queryFn: chatDomainInterface.chatQueryUseCases.fetchChats,
        enabled,
        select: (remoteChats) =>
            mergeChatSessions(
                queryClient.getQueryData<ChatSession[]>(
                    chatKeys.lists(viewerUserId),
                ) || [],
                remoteChats || [],
            ),
    });
};

export const useSaveChatMutation = () => {
    const queryClient = useQueryClient();
    const { data: session } = useSessionQuery();
    const viewerUserId = session?.user.id ?? null;

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
            return chatDomainInterface.chatQueryUseCases.saveChat(
                id,
                messages,
                title,
            );
        },
        onSuccess: async (savedChat) => {
            upsertSavedChatSession(queryClient, viewerUserId, savedChat);
            await queryClient.invalidateQueries({
                queryKey: chatKeys.lists(viewerUserId),
                refetchType: "inactive",
            });
        },
    });
};

export const useDeleteChatMutation = () => {
    const queryClient = useQueryClient();
    const { data: session } = useSessionQuery();
    const viewerUserId = session?.user.id ?? null;

    return useMutation({
        mutationFn: chatDomainInterface.chatQueryUseCases.deleteChat,
        onSuccess: async (_, deletedId) => {
            removeChatSession(queryClient, viewerUserId, deletedId);
            await queryClient.invalidateQueries({
                queryKey: chatKeys.lists(viewerUserId),
            });
        },
    });
};

export const useRenameChatMutation = () => {
    const queryClient = useQueryClient();
    const { data: session } = useSessionQuery();
    const viewerUserId = session?.user.id ?? null;

    return useMutation({
        mutationFn: async ({
            id,
            newTitle,
        }: {
            id: string;
            newTitle: string;
        }) => {
            return chatDomainInterface.chatQueryUseCases.renameChat(
                id,
                newTitle,
            );
        },
        onSuccess: async (_, { id, newTitle }) => {
            updateChatTitle(queryClient, viewerUserId, id, newTitle);
            await queryClient.invalidateQueries({
                queryKey: chatKeys.lists(viewerUserId),
            });
        },
    });
};

export const useGenerateTitleMutation = () => {
    return useMutation({
        mutationFn: async (messages: Message[]) => {
            return chatDomainInterface.chatQueryUseCases.generateTitle(
                messages,
            );
        },
    });
};
