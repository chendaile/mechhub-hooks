import type { ChatMode, Message, SubmitMessage } from "../types/message";

export const createChatTitle = (text: string) => text.slice(0, 15) || "新对话";

export const isSubmitMessageEmpty = ({
    text,
    imageUrls,
    fileAttachments,
}: SubmitMessage): boolean =>
    !text.trim() &&
    (!imageUrls || imageUrls.length === 0) &&
    (!fileAttachments || fileAttachments.length === 0);

export const upsertAssistantMessages = (
    messages: Message[],
    mode: ChatMode,
    aiResponse: Message,
): Message[] => {
    const hasPendingMessage = messages.some(
        (message) => message.id === aiResponse.id,
    );

    if (mode === "study" || hasPendingMessage) {
        return messages.map((message) =>
            message.id === aiResponse.id ? aiResponse : message,
        );
    }

    return [...messages, aiResponse];
};

