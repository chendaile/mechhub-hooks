import { supabase } from "../../../shared/supabase";
import type { Message } from "../../types";
import { deriveTitleMessages } from "./aiMessageMapper";

export interface AILogger {
    debug: (message: string, payload?: unknown) => void;
    error: (message: string, payload?: unknown) => void;
}

const noopLogger: AILogger = {
    debug: () => undefined,
    error: () => undefined,
};

export const generateTitle = async (
    messages: Message[],
    logger: AILogger = noopLogger,
): Promise<string> => {
    const { fallbackTitle, titleMessages } = deriveTitleMessages(messages);

    if (titleMessages.length === 0) {
        return fallbackTitle;
    }

    try {
        logger.debug("generateTitle.invoke", { titleMessages });

        const { data, error } = await supabase.functions.invoke(
            "chat-response",
            {
                body: {
                    messages: [
                        {
                            role: "system",
                            content:
                                "请用5-10个字总结下面对话的主题。只返回标题文本，不要其他内容。",
                        },
                        ...titleMessages,
                    ],
                },
            },
        );

        if (error) {
            logger.error("generateTitle.error", error);
            return fallbackTitle;
        }

        const reply = (data as { reply?: unknown } | null)?.reply;
        if (typeof reply !== "string" || !reply.trim()) {
            return fallbackTitle;
        }

        return reply.trim().slice(0, 30);
    } catch (error) {
        logger.error("generateTitle.exception", error);
        return fallbackTitle;
    }
};
