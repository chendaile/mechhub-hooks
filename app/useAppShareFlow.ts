import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useSharePrivateChatToClassMutation } from "../class/public";
import type { ShareIntent } from "./types/share";

interface ShareThreadGroup {
    classId: string;
    className: string;
    threads: Array<{
        id: string;
        title: string;
        threadType: "group" | "shared_chat";
    }>;
}

interface UseAppShareFlowProps {
    classThreadGroups: ShareThreadGroup[];
    currentSessionId: string | null;
}

export const useAppShareFlow = ({
    classThreadGroups,
    currentSessionId,
}: UseAppShareFlowProps) => {
    const [shareIntent, setShareIntent] = useState<ShareIntent | null>(null);

    const sharePrivateChatToClassMutation =
        useSharePrivateChatToClassMutation();

    const shareableThreadCount = useMemo(
        () =>
            classThreadGroups.reduce(
                (count, group) =>
                    count +
                    group.threads.filter(
                        (thread) => thread.threadType === "group",
                    ).length,
                0,
            ),
        [classThreadGroups],
    );

    const openSharePicker = useCallback(
        (intent: ShareIntent) => {
            if (shareableThreadCount === 0) {
                toast.error("无可分享线程，请联系老师创建。");
                return;
            }
            setShareIntent(intent);
        },
        [shareableThreadCount],
    );

    const handleShareChatMessageToClass = useCallback(
        (messageId: string) => {
            openSharePicker({ kind: "chatMessage", messageId });
        },
        [openSharePicker],
    );

    const handleShareChatSessionToClass = useCallback(
        (sessionId: string) => {
            openSharePicker({ kind: "chatSession", sessionId });
        },
        [openSharePicker],
    );

    const handleConfirmThreadShare = useCallback(
        async (classId: string, threadId: string) => {
            if (!shareIntent) {
                return;
            }

            try {
                if (shareIntent.kind === "chatMessage") {
                    if (!currentSessionId) {
                        toast.error(
                            "Open a private chat session before sharing.",
                        );
                        return;
                    }
                    await sharePrivateChatToClassMutation.mutateAsync({
                        classId,
                        threadId,
                        chatId: currentSessionId,
                        messageIds: [shareIntent.messageId],
                    });
                } else {
                    await sharePrivateChatToClassMutation.mutateAsync({
                        classId,
                        threadId,
                        chatId: shareIntent.sessionId,
                    });
                }
                setShareIntent(null);
                toast.success("Shared successfully to class thread.");
            } catch {
                // error handled by mutation
            }
        },
        [currentSessionId, shareIntent, sharePrivateChatToClassMutation],
    );

    return {
        shareIntent,
        setShareIntent,
        handleShareChatMessageToClass,
        handleShareChatSessionToClass,
        handleConfirmThreadShare,
        isSharing: sharePrivateChatToClassMutation.isPending,
    };
};
