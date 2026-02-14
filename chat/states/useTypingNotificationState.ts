import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { RefObject, UIEvent } from "react";

const NOTIFICATION_SOUND_URL =
    "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

interface UseTypingNotificationStateParams {
    isTyping: boolean;
    contentRef: RefObject<HTMLDivElement | null>;
    scrollToBottom: (behavior?: ScrollBehavior) => void;
}

const playNotificationSound = () => {
    try {
        const audio = new Audio(NOTIFICATION_SOUND_URL);
        audio.volume = 0.3;
        audio.play().catch(() => undefined);
    } catch {
        return;
    }
};

export const useTypingNotificationState = ({
    isTyping,
    contentRef,
    scrollToBottom,
}: UseTypingNotificationStateParams) => {
    const previousTypingRef = useRef(isTyping);
    const toastIdRef = useRef<string | number | null>(null);

    const handleScroll = (event: UIEvent<HTMLDivElement>) => {
        const target = event.currentTarget;
        const isAtBottom =
            target.scrollHeight - target.scrollTop - target.clientHeight < 70;

        if (isAtBottom && toastIdRef.current !== null) {
            toast.dismiss(toastIdRef.current);
            toastIdRef.current = null;
        }
    };

    useEffect(() => {
        const wasTyping = previousTypingRef.current;
        previousTypingRef.current = isTyping;

        if (!(wasTyping && !isTyping)) {
            return;
        }

        const scrollContainer = contentRef.current?.parentElement;
        if (!scrollContainer) {
            return;
        }

        const isAtBottom =
            scrollContainer.scrollHeight -
                scrollContainer.scrollTop -
                scrollContainer.clientHeight <
            300;

        if (isAtBottom) {
            return;
        }

        toastIdRef.current = toast.success("有新消息", {
            action: {
                label: "查看",
                onClick: () => {
                    scrollToBottom("smooth");
                },
            },
            actionButtonStyle: {
                background: "transparent",
                color: "inherit",
                border: "none",
                padding: 0,
            },
        });

        playNotificationSound();
    }, [contentRef, isTyping, scrollToBottom]);

    return {
        actions: {
            handleScroll,
        },
    };
};
