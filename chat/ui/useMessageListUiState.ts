import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Message } from "../types";
import { useImagePreviewState } from "./useImagePreviewState";

const NOTIFICATION_SOUND_URL =
    "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

interface UseMessageListUiStateProps {
    messages: Message[];
    isTyping: boolean;
    sessionId: string | null;
}

export const useMessageListUiState = ({
    messages,
    isTyping,
    sessionId,
}: UseMessageListUiStateProps) => {
    const { previewImage, openPreview, closePreview } = useImagePreviewState();
    const contentRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const prevSessionIdRef = useRef<string | null>(null);
    const prevIsTypingRef = useRef(isTyping);
    const toastIdRef = useRef<string | number | null>(null);
    const [autoOpenThinkingMessageId, setAutoOpenThinkingMessageId] = useState<
        string | null
    >(null);
    const prevAutoOpenMessageIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (sessionId !== prevSessionIdRef.current) {
            prevSessionIdRef.current = sessionId;
            setAutoOpenThinkingMessageId(null);
            prevAutoOpenMessageIdRef.current = null;
            if (sessionId) {
                setTimeout(() => {
                    if (messagesEndRef.current) {
                        messagesEndRef.current.scrollIntoView({
                            behavior: "auto",
                            block: "end",
                        });
                    }
                }, 0);
            }
        }
    }, [sessionId]);

    useEffect(() => {
        const scrollContainer = contentRef.current?.parentElement;
        const contentEl = contentRef.current;
        if (!scrollContainer || !contentEl) return;

        const observer = new ResizeObserver(() => {
            const isAtBottom =
                scrollContainer.scrollHeight -
                    scrollContainer.scrollTop -
                    scrollContainer.clientHeight <
                300;

            if (isAtBottom && messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({
                    behavior: "auto",
                    block: "nearest",
                });
            }
        });

        observer.observe(contentEl);
        return () => observer.disconnect();
    }, [messages]);

    useEffect(() => {
        if (!isTyping || messages.length === 0) return;

        let lastAssistantStudyId: string | null = null;
        for (let i = messages.length - 1; i >= 0; i -= 1) {
            const message = messages[i];
            if (message.role === "assistant" && message.mode === "study") {
                lastAssistantStudyId = message.id;
                break;
            }
        }

        if (!lastAssistantStudyId) return;
        if (lastAssistantStudyId === prevAutoOpenMessageIdRef.current) return;

        prevAutoOpenMessageIdRef.current = lastAssistantStudyId;
        setAutoOpenThinkingMessageId(lastAssistantStudyId);
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
        });
    }, [isTyping, messages]);

    const playNotificationSound = () => {
        try {
            const audio = new Audio(NOTIFICATION_SOUND_URL);
            audio.volume = 0.3;
            audio
                .play()
                .catch((error) => console.log("Audio play failed", error));
        } catch (error) {
            console.error("Audio error", error);
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const isAtBottom =
            target.scrollHeight - target.scrollTop - target.clientHeight < 70;

        if (isAtBottom && toastIdRef.current !== null) {
            toast.dismiss(toastIdRef.current);
            toastIdRef.current = null;
        }
    };

    useEffect(() => {
        const wasTyping = prevIsTypingRef.current;
        const isNowTyping = isTyping;
        prevIsTypingRef.current = isNowTyping;

        if (wasTyping && !isNowTyping) {
            const scrollContainer = contentRef.current?.parentElement;
            if (!scrollContainer) return;

            const isAtBottom =
                scrollContainer.scrollHeight -
                    scrollContainer.scrollTop -
                    scrollContainer.clientHeight <
                300;

            if (!isAtBottom) {
                toastIdRef.current = toast.success("有新消息", {
                    action: {
                        label: "查看",
                        onClick: () => {
                            messagesEndRef.current?.scrollIntoView({
                                behavior: "smooth",
                                block: "end",
                            });
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
            }
        }
    }, [isTyping]);

    return {
        contentRef,
        messagesEndRef,
        previewImage,
        openPreview,
        closePreview,
        handleScroll,
        autoOpenThinkingMessageId,
    };
};
