import { useState } from "react";

const DEFAULT_CHAT_MODEL = "qwen3.5-plus";

export const useChatModelState = (initialModel?: string) => {
    const [model, setModel] = useState(initialModel ?? DEFAULT_CHAT_MODEL);

    return {
        model,
        setModel,
    };
};
