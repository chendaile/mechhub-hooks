import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import type { SubmitMessage } from "../chat/types";
import {
    useClassThreadMessagesQuery,
    usePostClassMessageMutation,
} from "./queries/useClassQueries";

const deriveClassMessageContent = (content: Record<string, unknown>) => {
    if (typeof content.text === "string" && content.text.trim()) {
        return content.text;
    }

    if (content.kind === "shared_chat") {
        const sourceTitle =
            typeof content.sourceTitle === "string"
                ? content.sourceTitle
                : "未命名会话";
        return `分享了私聊会话：${sourceTitle}`;
    }

    if (content.kind === "shared_grade") {
        return "Shared a grade result.";
    }

    try {
        return JSON.stringify(content);
    } catch {
        return "[Unsupported message content]";
    }
};

const hasAttachments = (payload: SubmitMessage) =>
    Boolean(payload.imageUrls?.length || payload.fileAttachments?.length);

export const useClassThreadChatState = (threadId: string) => {
    const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
    const threadMessagesQuery = useClassThreadMessagesQuery(
        threadId,
        !!threadId,
    );
    const postClassMessageMutation = usePostClassMessageMutation();

    const sortedMessages = useMemo(() => {
        const messages = threadMessagesQuery.data ?? [];

        return [...messages].sort(
            (left, right) =>
                new Date(left.createdAt).getTime() -
                new Date(right.createdAt).getTime(),
        );
    }, [threadMessagesQuery.data]);

    useEffect(() => {
        scrollAnchorRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
        });
    }, [sortedMessages.length]);

    const handleSendDraft = async (payload: SubmitMessage) => {
        const text = payload.text.trim();
        const mentionsAi = /@ai\b/i.test(text);

        if (!text) {
            toast.warning("请输入消息文本。");
            return;
        }

        if (!mentionsAi) {
            if (hasAttachments(payload)) {
                toast.warning("未使用 @ai 时不支持附件。");
                return;
            }

            try {
                await postClassMessageMutation.mutateAsync({
                    threadId,
                    content: { text },
                });
            } catch {}
            return;
        }

        if (payload.mode === "correct" && !payload.imageUrls?.length) {
            toast.warning("@ai 批改模式需要至少上传一张图片。");
            return;
        }

        try {
            await postClassMessageMutation.mutateAsync({
                threadId,
                content: {
                    text,
                    aiMode: payload.mode,
                    aiModel: payload.model,
                    imageUrls: payload.imageUrls ?? [],
                    fileAttachments: payload.fileAttachments ?? [],
                },
            });
        } catch {
        }
    };

    return {
        state: {
            messages: sortedMessages,
            scrollAnchorRef,
        },
        actions: {
            handleSendDraft,
        },
        derived: {
            renderMessageContent: deriveClassMessageContent,
        },
        meta: {
            isSending: postClassMessageMutation.isPending,
            isLoadingMessages: threadMessagesQuery.isLoading,
            isFetchingMessages: threadMessagesQuery.isFetching,
        },
        sortedMessages,
        scrollAnchorRef,
        isSending: postClassMessageMutation.isPending,
        handleSendDraft,
        renderMessageContent: deriveClassMessageContent,
    };
};
