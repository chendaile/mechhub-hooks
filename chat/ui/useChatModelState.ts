import { useState } from "react";

const DEFAULT_CHAT_MODEL = "qwen3-vl-235b-a22b-thinking";

export const useChatModelState = (initialModel?: string) => {
    const [model, setModel] = useState(initialModel ?? DEFAULT_CHAT_MODEL);

    return {
        model,
        setModel,
    };
};
