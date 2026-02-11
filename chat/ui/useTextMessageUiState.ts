import { useEffect, useRef, useState } from "react";
import { useTextCopyState } from "./useTextCopyState";

interface UseTextMessageUiStateOptions {
    autoOpenThinking?: boolean;
}

export const useTextMessageUiState = (
    text: string,
    options: UseTextMessageUiStateOptions = {},
) => {
    const { isCopied, handleCopyText } = useTextCopyState(text);
    const [thinkingOpen, setThinkingOpen] = useState(false);
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
        handleToggleThinking,
        isAttachmentExpanded,
        handleToggleAttachment,
    };
};
