import { useRef } from "react";
import { toast } from "sonner";
import type { AttachmentNotifier } from "../model/attachment";
import {
    useAttachmentUploadFlow,
    type UploadImageHandler,
} from "../flow/useAttachmentUploadFlow";
import { useImageAttachmentState } from "../states/useImageAttachmentState";
import { useTextAttachmentState } from "../states/useTextAttachmentState";

export type {
    UploadImageHandler,
    UploadImageResult,
} from "../flow/useAttachmentUploadFlow";

interface UseAttachmentUploadStateParams {
    uploadImage: UploadImageHandler;
    notifier?: AttachmentNotifier;
}

const defaultNotifier: AttachmentNotifier = {
    error: (message: string) => {
        toast.error(message);
    },
};

export const useAttachmentUploadState = ({
    uploadImage,
    notifier = defaultNotifier,
}: UseAttachmentUploadStateParams) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageState = useImageAttachmentState();
    const textState = useTextAttachmentState();

    const flow = useAttachmentUploadFlow({
        uploadImage,
        imageState,
        textState,
        fileInputRef,
        notifier,
    });

    const resetAttachments = () => {
        imageState.actions.resetAttachments();
        textState.actions.resetAttachments();
    };

    const state = {
        fileInputRef,
        imageAttachments: imageState.state.imageAttachments,
        fileAttachments: textState.state.fileAttachments,
    };

    const actions = {
        handleUploadClick: flow.actions.handleUploadClick,
        handleFileChange: flow.actions.handleFileChange,
        removeImageAttachment: imageState.actions.removeAttachment,
        removeFileAttachment: textState.actions.removeAttachment,
        resetAttachments,
    };

    const derived = {
        isUploading: imageState.derived.isUploading,
        uploadedImageUrls: imageState.derived.uploadedImageUrls,
    };

    return {
        state,
        actions,
        derived,
        fileInputRef: state.fileInputRef,
        imageAttachments: state.imageAttachments,
        fileAttachments: state.fileAttachments,
        isUploading: derived.isUploading,
        uploadedImageUrls: derived.uploadedImageUrls,
        handleUploadClick: actions.handleUploadClick,
        handleFileChange: actions.handleFileChange,
        removeImageAttachment: actions.removeImageAttachment,
        removeFileAttachment: actions.removeFileAttachment,
        resetAttachments: actions.resetAttachments,
    };
};
