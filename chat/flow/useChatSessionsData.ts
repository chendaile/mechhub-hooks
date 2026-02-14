import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import {
    useChatsQuery,
    useDeleteChatMutation,
    useRenameChatMutation,
} from "../queries/useChatQueries";
import { getHooksLogger } from "../../shared/logger";

export const useChatSessionsData = (
    session: Session | null,
    isEnabled = true,
) => {
    const logger = getHooksLogger();
    const {
        data: chatSessions = [],
        isLoading,
        isFetching,
    } = useChatsQuery(!!session && isEnabled);
    const isLoadingSessions = isLoading || isFetching;
    const deleteChatMutation = useDeleteChatMutation();
    const renameChatMutation = useRenameChatMutation();

    const deleteChatSession = async (id: string) => {
        if (!session || !isEnabled) return { success: false };

        try {
            await deleteChatMutation.mutateAsync(id);
            return { success: true };
        } catch (error) {
            logger.error("Failed to delete chat", error);
            return { success: false };
        }
    };

    const handleRenameSession = async (id: string, newTitle: string) => {
        if (!isEnabled) {
            return false;
        }

        try {
            await renameChatMutation.mutateAsync({ id, newTitle });
            return true;
        } catch (error) {
            logger.error("Failed to rename chat", error);
            const message =
                error instanceof Error ? error.message : String(error ?? "");
            const isNetworkOrCorsError =
                message.includes("Failed to fetch") ||
                message.includes("NetworkError") ||
                message.includes("CORS");
            toast.error(
                isNetworkOrCorsError
                    ? "重命名失败：网络或跨域异常（CORS）。请刷新后重试。"
                    : "重命名失败，请稍后重试。",
            );
            return false;
        }
    };

    return {
        chatSessions,
        isLoadingSessions,
        deleteChatSession,
        handleRenameSession,
    };
};
