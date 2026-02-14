import type { ChatMode, FileAttachment, SubmitMessage } from "../chat/types";
import { useActiveViewState } from "./states/useActiveViewState";
import {
    buildStartChatPayload,
    buildSubmitMessagePayload,
} from "./utils/messagePayloadBuilders";

interface UseAppViewParams {
    handleSendMessage: (
        payload: SubmitMessage,
        switchToChatView: () => void,
    ) => void;
}

export const useAppView = ({ handleSendMessage }: UseAppViewParams) => {
    const activeViewState = useActiveViewState("home");

    const switchToChat = () => {
        activeViewState.actions.setActiveView("chat");
    };

    const onSendMessage = (payload: SubmitMessage) => {
        handleSendMessage(buildSubmitMessagePayload(payload), switchToChat);
    };

    const onStartChat = (
        message?: string,
        imageUrls?: string[],
        fileAttachments?: FileAttachment[],
        model?: string,
        mode: ChatMode = "study",
    ) => {
        const payload = buildStartChatPayload({
            message,
            imageUrls,
            fileAttachments,
            model,
            mode,
        });

        if (!payload) {
            return;
        }

        handleSendMessage(payload, switchToChat);
    };

    return {
        state: {
            activeView: activeViewState.state.activeView,
        },
        actions: {
            setActiveView: activeViewState.actions.setActiveView,
            onSendMessage,
            onStartChat,
        },
        activeView: activeViewState.state.activeView,
        setActiveView: activeViewState.actions.setActiveView,
        onSendMessage,
        onStartChat,
    };
};
