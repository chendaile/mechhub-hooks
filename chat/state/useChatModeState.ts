import { useState } from "react";
import { ChatMode } from "../types/message";

const DEFAULT_CHAT_MODE: ChatMode = "study";

export const useChatModeState = () => {
    const [chatMode, setChatMode] = useState<ChatMode>(DEFAULT_CHAT_MODE);

    const resetChatMode = () => setChatMode(DEFAULT_CHAT_MODE);

    return {
        chatMode,
        setChatMode,
        resetChatMode,
    };
};


