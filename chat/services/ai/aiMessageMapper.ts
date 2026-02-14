import type { Message } from "../../types";

interface ApiTextContentPart {
    type: "text";
    text: string;
}

interface ApiImageContentPart {
    type: "image_url";
    image_url: {
        url: string;
    };
}

type ApiContentPart = ApiTextContentPart | ApiImageContentPart;

type ApiMessage = {
    role: Message["role"];
    content: string | ApiContentPart[];
};

const getMessageText = (message: Message & { content?: unknown }): string => {
    if (typeof message.text === "string") {
        return message.text;
    }

    if (typeof message.content === "string") {
        return message.content;
    }

    return "";
};

const appendFileContentsToText = (message: Message): string => {
    let textContent = getMessageText(message) || " ";

    if (message.fileAttachments && message.fileAttachments.length > 0) {
        const fileContents = message.fileAttachments
            .map((file) => {
                const language = file.language || "text";
                return `\n\n**File: ${file.filename}**\n\`\`\`${language}\n${file.content}\n\`\`\``;
            })
            .join("");
        textContent += fileContents;
    }

    return textContent;
};

const buildUserMultimodalContent = (message: Message): ApiContentPart[] => {
    const contentParts: ApiContentPart[] = [
        {
            type: "text",
            text: appendFileContentsToText(message),
        },
    ];

    if (message.imageUrls && message.imageUrls.length > 0) {
        message.imageUrls.forEach((url) => {
            contentParts.push({
                type: "image_url",
                image_url: { url },
            });
        });
    }

    return contentParts;
};

const mapSingleMessage = (message: Message): ApiMessage => {
    if (
        message.role === "user" &&
        ((message.imageUrls && message.imageUrls.length > 0) ||
            (message.fileAttachments && message.fileAttachments.length > 0))
    ) {
        return {
            role: message.role,
            content: buildUserMultimodalContent(message),
        };
    }

    if (
        message.role === "user" &&
        message.fileAttachments &&
        message.fileAttachments.length > 0
    ) {
        return {
            role: message.role,
            content: appendFileContentsToText(message),
        };
    }

    return {
        role: message.role,
        content: getMessageText(message) || " ",
    };
};

export const mapMessagesToApiPayload = (messages: Message[]): ApiMessage[] =>
    messages.map(mapSingleMessage);

export const getLatestUserImageUrls = (messages: Message[]): string[] => {
    const latestUserMessage = messages
        .filter((message) => message.role === "user")
        .pop();
    return latestUserMessage?.imageUrls || [];
};

export const deriveTitleMessages = (messages: Message[]) => {
    const recentMessages = messages.slice(0, 2);

    if (recentMessages.length === 0) {
        return {
            fallbackTitle: "新对话",
            titleMessages: [] as Array<{ role: string; content: string }>,
        };
    }

    const firstMessage = recentMessages[0];
    const firstMessageText = getMessageText(firstMessage);

    let fallbackTitle = "新对话";
    if (firstMessageText && firstMessageText.trim()) {
        fallbackTitle = firstMessageText.slice(0, 15);
    } else if (firstMessage.imageUrls && firstMessage.imageUrls.length > 0) {
        fallbackTitle = "图片讨论";
    } else if (
        firstMessage.fileAttachments &&
        firstMessage.fileAttachments.length > 0
    ) {
        fallbackTitle = "文件讨论";
    }

    const titleMessages: Array<{ role: string; content: string }> = [];

    if (firstMessageText && firstMessageText.trim()) {
        titleMessages.push({
            role: firstMessage.role,
            content: firstMessageText,
        });
    } else if (firstMessage.imageUrls && firstMessage.imageUrls.length > 0) {
        titleMessages.push({
            role: "user",
            content: "用户上传了图片进行讨论",
        });
    } else if (
        firstMessage.fileAttachments &&
        firstMessage.fileAttachments.length > 0
    ) {
        titleMessages.push({
            role: "user",
            content: "用户上传了文件进行讨论",
        });
    }

    const aiResponse = recentMessages[1];
    const aiResponseText = aiResponse ? getMessageText(aiResponse) : "";
    if (aiResponseText && aiResponseText.trim()) {
        titleMessages.push({
            role: aiResponse.role,
            content: aiResponseText,
        });
    }

    return {
        fallbackTitle,
        titleMessages,
    };
};
