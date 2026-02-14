import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
    useClassThreadMessagesQuery,
    usePostClassMessageMutation,
} from "./queries/useClassQueries";

const deriveClassMessageContent = (content: Record<string, unknown>) => {
    if (typeof content.text === "string" && content.text.trim()) {
        return content.text;
    }

    if (content.kind === "shared_chat") {
        return "Shared a private chat session.";
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

export const useClassThreadChatState = (threadId: string) => {
    const [inputValue, setInputValue] = useState("");
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

    const handleInputChange = (value: string) => {
        setInputValue(value);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const text = inputValue.trim();
        if (!text) {
            return;
        }

        try {
            await postClassMessageMutation.mutateAsync({
                threadId,
                content: { text },
            });
            setInputValue("");
        } catch {}
    };

    return {
        state: {
            inputValue,
            messages: sortedMessages,
            scrollAnchorRef,
        },
        actions: {
            handleInputChange,
            handleSubmit,
        },
        derived: {
            renderMessageContent: deriveClassMessageContent,
        },
        meta: {
            isSending: postClassMessageMutation.isPending,
            isLoadingMessages: threadMessagesQuery.isLoading,
            isFetchingMessages: threadMessagesQuery.isFetching,
        },
        inputValue,
        setInputValue: handleInputChange,
        sortedMessages,
        scrollAnchorRef,
        isSending: postClassMessageMutation.isPending,
        handleSubmit,
        renderMessageContent: deriveClassMessageContent,
    };
};
