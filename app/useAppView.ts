import { useState } from "react";
import { ChatMode, FileAttachment, SubmitMessage } from "../chat/types";
import { ActiveView } from "./types/view";

interface UseAppViewParams {
    handleSendMessage: (
        payload: SubmitMessage,
        switchToChatView: () => void,
    ) => void;
}

export const useAppView = ({ handleSendMessage }: UseAppViewParams) => {
    const [activeView, setActiveView] = useState<ActiveView>("home");

    const switchToChat = () => setActiveView("chat");

    const onSendMessage = (payload: SubmitMessage) => {
        handleSendMessage(payload, switchToChat);
    };

    const onStartChat = (
        message?: string,
        imageUrls?: string[],
        fileAttachments?: FileAttachment[],
        model: string = "qwen3-vl-235b-a22b-thinking",
        mode: ChatMode = "study",
    ) => {
        const hasContent =
            !!message?.trim() ||
            (imageUrls && imageUrls.length > 0) ||
            (fileAttachments && fileAttachments.length > 0);

        if (!hasContent) {
            switchToChat();
            return;
        }

        const payload: SubmitMessage = {
            text: message ?? "",
            model,
            mode,
            ...(imageUrls && imageUrls.length > 0 ? { imageUrls } : {}),
            ...(fileAttachments && fileAttachments.length > 0
                ? { fileAttachments }
                : {}),
        };

        handleSendMessage(payload, switchToChat);
    };

    return {
        activeView,
        setActiveView,
        onSendMessage,
        onStartChat,
    };
};
