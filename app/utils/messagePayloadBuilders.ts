import type { ChatMode, FileAttachment, SubmitMessage } from "../../chat/types";

const DEFAULT_CHAT_MODEL = "qwen3.5-plus";

export const buildSubmitMessagePayload = (
    payload: SubmitMessage,
): SubmitMessage => ({
    text: payload.text,
    mode: payload.mode,
    model: payload.model,
    ...(payload.imageUrls && payload.imageUrls.length > 0
        ? { imageUrls: payload.imageUrls }
        : {}),
    ...(payload.fileAttachments && payload.fileAttachments.length > 0
        ? { fileAttachments: payload.fileAttachments }
        : {}),
});

interface BuildStartChatPayloadParams {
    message?: string;
    imageUrls?: string[];
    fileAttachments?: FileAttachment[];
    model?: string;
    mode?: ChatMode;
}

export const buildStartChatPayload = ({
    message,
    imageUrls,
    fileAttachments,
    model = DEFAULT_CHAT_MODEL,
    mode = "study",
}: BuildStartChatPayloadParams): SubmitMessage | null => {
    const hasContent =
        Boolean(message?.trim()) ||
        Boolean(imageUrls && imageUrls.length > 0) ||
        Boolean(fileAttachments && fileAttachments.length > 0);

    if (!hasContent) {
        return null;
    }

    return {
        text: message ?? "",
        model,
        mode,
        ...(imageUrls && imageUrls.length > 0 ? { imageUrls } : {}),
        ...(fileAttachments && fileAttachments.length > 0
            ? { fileAttachments }
            : {}),
    };
};
