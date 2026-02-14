import { useMemo, useState } from "react";
import type { ImageAttachment } from "../model/attachment";

const createAttachmentId = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2, 11);

const toPendingImageAttachment = (file: File): ImageAttachment => ({
    id: createAttachmentId(),
    file,
    previewUrl: URL.createObjectURL(file),
    uploading: true,
    isUploading: true,
});

export const useImageAttachmentState = () => {
    const [imageAttachments, setImageAttachments] = useState<ImageAttachment[]>(
        [],
    );

    const addPendingAttachments = (files: File[]) => {
        const pendingAttachments = files.map(toPendingImageAttachment);
        setImageAttachments((previous) => [...previous, ...pendingAttachments]);
        return pendingAttachments;
    };

    const markAttachmentUploaded = (id: string, publicUrl: string) => {
        setImageAttachments((previous) =>
            previous.map((attachment) =>
                attachment.id === id
                    ? {
                          ...attachment,
                          uploading: false,
                          isUploading: false,
                          publicUrl,
                      }
                    : attachment,
            ),
        );
    };

    const removeAttachment = (id: string) => {
        setImageAttachments((previous) =>
            previous.filter((attachment) => attachment.id !== id),
        );
    };

    const removeAttachments = (ids: string[]) => {
        const idSet = new Set(ids);
        setImageAttachments((previous) =>
            previous.filter((attachment) => !idSet.has(attachment.id)),
        );
    };

    const resetAttachments = () => {
        setImageAttachments([]);
    };

    const totalImageBytes = useMemo(
        () =>
            imageAttachments.reduce(
                (total, attachment) => total + attachment.file.size,
                0,
            ),
        [imageAttachments],
    );

    const uploadedImageUrls = useMemo(
        () =>
            imageAttachments
                .map((attachment) => attachment.publicUrl)
                .filter((url): url is string => Boolean(url)),
        [imageAttachments],
    );

    const isUploading = useMemo(
        () =>
            imageAttachments.some(
                (attachment) => attachment.isUploading || attachment.uploading,
            ),
        [imageAttachments],
    );

    return {
        state: {
            imageAttachments,
        },
        actions: {
            addPendingAttachments,
            markAttachmentUploaded,
            removeAttachment,
            removeAttachments,
            resetAttachments,
        },
        derived: {
            totalImageBytes,
            uploadedImageUrls,
            isUploading,
        },
    };
};
