import type { FileAttachment } from "../types";

export interface ImageAttachment {
    id: string;
    file: File;
    previewUrl: string;
    uploading: boolean;
    isUploading: boolean;
    publicUrl?: string;
}

export interface AttachmentNotifier {
    error: (message: string) => void;
}

export type TextAttachment = FileAttachment;
