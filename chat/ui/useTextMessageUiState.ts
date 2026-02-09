import { useState } from "react";
import { useTextCopyState } from "./useTextCopyState";

export const useTextMessageUiState = (text: string) => {
    const { isCopied, handleCopyText } = useTextCopyState(text);
    const [thinkingOpen, setThinkingOpen] = useState(false);
    const [expandedAttachmentMap, setExpandedAttachmentMap] = useState<
        Record<number, boolean>
    >({});

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
