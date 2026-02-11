import { useState } from "react";
import { ChatMode, FileAttachment, SubmitMessage } from "../chat/types/message";
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

    const onSendMessage = (
        text: string,
        imageUrls?: string[],
        fileAttachments?: FileAttachment[],
        model: string = "qwen3-vl-235b-a22b-thinking",
        mode: ChatMode = "study",
    ) => {
        const payload = { text, imageUrls, fileAttachments, model, mode };
        handleSendMessage(payload, switchToChat);
    };

    return {
        activeView,
        setActiveView,
        onSendMessage,
    };
};
