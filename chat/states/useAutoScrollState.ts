import { useEffect, useRef } from "react";
import type { Message } from "../types";

interface UseAutoScrollStateParams {
    messages: Message[];
    sessionId: string | null;
}

export const useAutoScrollState = ({
    messages,
    sessionId,
}: UseAutoScrollStateParams) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const previousSessionIdRef = useRef<string | null>(null);

    const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
        messagesEndRef.current?.scrollIntoView({
            behavior,
            block: "end",
        });
    };

    useEffect(() => {
        if (sessionId === previousSessionIdRef.current) {
            return;
        }

        previousSessionIdRef.current = sessionId;

        if (!sessionId) {
            return;
        }

        setTimeout(() => {
            scrollToBottom("auto");
        }, 0);
    }, [sessionId]);

    useEffect(() => {
        const scrollContainer = contentRef.current?.parentElement;
        const contentElement = contentRef.current;
        if (!scrollContainer || !contentElement) {
            return;
        }

        const observer = new ResizeObserver(() => {
            const isAtBottom =
                scrollContainer.scrollHeight -
                    scrollContainer.scrollTop -
                    scrollContainer.clientHeight <
                300;

            if (isAtBottom) {
                messagesEndRef.current?.scrollIntoView({
                    behavior: "auto",
                    block: "nearest",
                });
            }
        });

        observer.observe(contentElement);
        return () => observer.disconnect();
    }, [messages]);

    return {
        state: {
            contentRef,
            messagesEndRef,
        },
        actions: {
            scrollToBottom,
        },
    };
};
