import { useEffect, useRef, useState } from "react";
import { useTextCopyState } from "./useTextCopyState";

interface UseTextMessageUiStateOptions {
    autoOpenThinking?: boolean;
    autoScrollThinking?: boolean;
    reasoning?: string;
}

export const useTextMessageUiState = (
    text: string,
    options: UseTextMessageUiStateOptions = {},
) => {
    const { isCopied, handleCopyText } = useTextCopyState(text);
    const [thinkingOpen, setThinkingOpen] = useState(false);
    const thinkingContentRef = useRef<HTMLDivElement>(null);
    const [expandedAttachmentMap, setExpandedAttachmentMap] = useState<
        Record<number, boolean>
    >({});
    const hasAutoOpenedRef = useRef(false);

    useEffect(() => {
        if (options.autoOpenThinking && !hasAutoOpenedRef.current) {
            setThinkingOpen(true);
            hasAutoOpenedRef.current = true;
        }
    }, [options.autoOpenThinking]);

    useEffect(() => {
        if (!options.autoScrollThinking || !thinkingOpen) {
            return;
        }

        const element = thinkingContentRef.current;
        if (!element) {
            return;
        }

        const raf = requestAnimationFrame(() => {
            element.scrollTop = element.scrollHeight;
        });

        return () => cancelAnimationFrame(raf);
    }, [options.autoScrollThinking, options.reasoning, thinkingOpen]);

    const handleToggleThinking = () => {
        setThinkingOpen((prev) => !prev);
    };

    const handleToggleAttachment = (index: number) => {
        setExpandedAttachmentMap((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    const isAttachmentExpanded = (index: number) =>
        Boolean(expandedAttachmentMap[index]);

    return {
        isCopied,
        handleCopyText,
        thinkingOpen,
        thinkingContentRef,
        handleToggleThinking,
        isAttachmentExpanded,
        handleToggleAttachment,
    };
};
