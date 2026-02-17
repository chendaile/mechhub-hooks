import type { Message } from "../types";

const DEFAULT_IMPORTED_MODEL = "qwen3.5-plus";

export const normalizeSnapshotMessage = (value: unknown): Message | null => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null;
    }

    const record = value as Record<string, unknown>;
    const role = record.role === "assistant" ? "assistant" : "user";
    const text =
        typeof record.text === "string"
            ? record.text
            : typeof record.content === "string"
              ? record.content
              : "";

    const imageUrls = Array.isArray(record.imageUrls)
        ? record.imageUrls.filter(
              (item): item is string => typeof item === "string",
          )
        : undefined;

    const fileAttachments = Array.isArray(record.fileAttachments)
        ? record.fileAttachments
              .map((item) => {
                  if (!item || typeof item !== "object" || Array.isArray(item)) {
                      return null;
                  }
                  const attachment = item as Record<string, unknown>;
                  const filename =
                      typeof attachment.filename === "string"
                          ? attachment.filename
                          : "";
                  const content =
                      typeof attachment.content === "string"
                          ? attachment.content
                          : "";
                  const language =
                      typeof attachment.language === "string"
                          ? attachment.language
                          : undefined;

                  if (!filename || !content) {
                      return null;
                  }

                  return {
                      filename,
                      content,
                      ...(language ? { language } : {}),
                  };
              })
              .filter((item) => !!item)
        : undefined;

    const mode = record.mode === "correct" ? "correct" : "study";
    const model =
        typeof record.model === "string" && record.model.trim()
            ? record.model
            : DEFAULT_IMPORTED_MODEL;
    const type = record.type === "grading" ? "grading" : "text";

    return {
        id:
            typeof record.id === "string" && record.id
                ? record.id
                : typeof record.messageId === "string" && record.messageId
                  ? record.messageId
                  : crypto.randomUUID(),
        role,
        type,
        text,
        mode,
        model,
        ...(imageUrls && imageUrls.length > 0 ? { imageUrls } : {}),
        ...(fileAttachments && fileAttachments.length > 0
            ? { fileAttachments }
            : {}),
        ...(typeof record.reasoning === "string"
            ? { reasoning: record.reasoning }
            : {}),
        ...(typeof record.ocrText === "string"
            ? { ocrText: record.ocrText }
            : {}),
        ...(typeof record.createdAt === "string"
            ? { createdAt: record.createdAt }
            : {}),
        ...(record.gradingResult &&
        typeof record.gradingResult === "object" &&
        !Array.isArray(record.gradingResult)
            ? {
                  gradingResult: record.gradingResult as NonNullable<
                      Message["gradingResult"]
                  >,
              }
            : {}),
    };
};

export const normalizeSnapshotMessages = (value: unknown): Message[] => {
    if (Array.isArray(value)) {
        return value
            .map(normalizeSnapshotMessage)
            .filter((message): message is Message => !!message);
    }

    const message = normalizeSnapshotMessage(value);
    return message ? [message] : [];
};
