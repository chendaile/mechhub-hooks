import { useState } from "react";
import {
    ChatMode,
    FileAttachment,
    SubmitMessage,
} from "../chat/types/message";
import { ActiveView } from "./types/view";

interface UseAppViewParams {
    handleSendMessage: (
        payload: SubmitMessage,
        switchToChatView?: () => void,
    ) => void;
}

export const useAppView = ({ handleSendMessage }: UseAppViewParams) => {
    const [activeView, setActiveView] = useState<ActiveView>("home");

    const switchToChat = () => setActiveView("chat");

    const onSendMessage = (payload: SubmitMessage) => {
        handleSendMessage(payload, switchToChat);
    };

    const onSendMessageWrapper = (
        text: string,
        imageUrls?: string[],
        fileAttachments?: FileAttachment[],
        model?: string,
        mode: ChatMode = "study",
    ) => {
        onSendMessage({
            text,
            imageUrls,
            fileAttachments,
            model: model || "qwen3-vl-235b-a22b-thinking",
            mode,
        });
    };

    const onStartChat = (
        message?: string,
        imageUrls?: string[],
        fileAttachments?: FileAttachment[],
        model?: string,
        mode: ChatMode = "study",
    ) => {
        onSendMessageWrapper(
            message || (imageUrls || fileAttachments ? "" : "我们开始吧！"),
            imageUrls,
            fileAttachments,
            model,
            mode,
        );
    };

    return {
        activeView,
        setActiveView,
        onSendMessage,
        onSendMessageWrapper,
        onStartChat,
    };
};
