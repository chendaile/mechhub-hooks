import { useState } from "react";
import { toast } from "sonner";
import { ChatMode, FileAttachment, SubmitMessage } from "../types";

interface UseSendParams {
    mode: ChatMode;
    model: string;
    isUploading: boolean;
    uploadedImageUrls: string[];
    fileAttachments: FileAttachment[];
    resetAttachments: () => void;
}

export const useSendState = ({
    mode,
    model,
    isUploading,
    uploadedImageUrls,
    fileAttachments,
    resetAttachments,
}: UseSendParams) => {
    const [inputValue, setInputValue] = useState("");

    const submitDraft = (): SubmitMessage | null => {
        if (isUploading) {
            toast.warning("请等待图片上传完成");
            return null;
        }

        if (mode === "correct" && uploadedImageUrls.length === 0) {
            toast.warning("批改模式需要至少上传一张照片");
            return null;
        }

        if (
            inputValue.trim() ||
            uploadedImageUrls.length > 0 ||
            fileAttachments.length > 0
        ) {
            const payload: SubmitMessage = {
                text: inputValue,
                mode,
                model,
                ...(uploadedImageUrls.length > 0
                    ? { imageUrls: uploadedImageUrls }
                    : {}),
                ...(fileAttachments.length > 0
                    ? { fileAttachments }
                    : {}),
            };
            setInputValue("");
            resetAttachments();
            return payload;
        }

        return null;
    };

    return {
        inputValue,
        setInputValue,
        submitDraft,
    };
};

