import { useState, useRef } from "react";
import { toast } from "sonner";
import { FileAttachment } from "../types";

interface ImageAttachment {
    id: string;
    file: File;
    previewUrl: string;
    uploading: boolean;
    publicUrl?: string;
}

const SUPPORTED_TEXT_FILE_EXTENSIONS = [
    ".txt",
    ".py",
    ".js",
    ".java",
    ".cpp",
    ".c",
    ".go",
    ".rs",
    ".rb",
    ".php",
    ".ts",
    ".tsx",
    ".jsx",
    ".sql",
    ".html",
    ".css",
    ".json",
    ".yaml",
    ".yml",
    ".xml",
    ".md",
    ".markdown",
    ".sh",
    ".bash",
];

const LANGUAGE_MAP: { [key: string]: string } = {
    ".py": "python",
    ".js": "javascript",
    ".jsx": "javascript",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".java": "java",
    ".cpp": "cpp",
    ".c": "c",
    ".go": "go",
    ".rs": "rust",
    ".rb": "ruby",
    ".php": "php",
    ".sql": "sql",
    ".html": "html",
    ".css": "css",
    ".json": "json",
    ".yaml": "yaml",
    ".yml": "yaml",
    ".xml": "xml",
    ".md": "markdown",
    ".markdown": "markdown",
    ".sh": "bash",
    ".bash": "bash",
};

const MAX_TOTAL_IMAGE_BYTES = 10 * 1024 * 1024;

export interface UploadImageResult {
    publicUrl: string;
    storagePath?: string;
}

export type UploadImageHandler = (file: File) => Promise<UploadImageResult>;

interface UseAttachmentUploadStateParams {
    uploadImage: UploadImageHandler;
}

export const useAttachmentUploadState = ({
    uploadImage,
}: UseAttachmentUploadStateParams) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imageAttachments, setImageAttachments] = useState<ImageAttachment[]>(
        [],
    );
    const [fileAttachments, setFileAttachments] = useState<FileAttachment[]>(
        [],
    );

    const isTextFile = (filename: string): boolean => {
        const extension = "." + filename.split(".").pop()?.toLowerCase();
        return SUPPORTED_TEXT_FILE_EXTENSIONS.includes(extension);
    };

    const getLanguageFromFilename = (filename: string): string | undefined => {
        const extension = "." + filename.split(".").pop()?.toLowerCase();
        return LANGUAGE_MAP[extension];
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);

            const imagesToUpload: ImageAttachment[] = [];
            const textsToRead: File[] = [];

            for (const file of newFiles) {
                if (file.type.startsWith("image/")) {
                    imagesToUpload.push({
                        id: Math.random().toString(36).substr(2, 9),
                        file,
                        previewUrl: URL.createObjectURL(file),
                        uploading: true,
                    });
                } else if (isTextFile(file.name)) {
                    textsToRead.push(file);
                } else {
                    toast.error(`不支持的文件类型: ${file.name}`);
                }
            }

            if (imagesToUpload.length > 0) {
                const existingImageBytes = imageAttachments.reduce(
                    (total, item) => total + item.file.size,
                    0,
                );
                const newImageBytes = imagesToUpload.reduce(
                    (total, item) => total + item.file.size,
                    0,
                );

                if (existingImageBytes + newImageBytes > MAX_TOTAL_IMAGE_BYTES) {
                    toast.error("图片总大小不能超过 10MB");
                    imagesToUpload.length = 0;
                }
            }

            if (imagesToUpload.length > 0) {
                setImageAttachments((prev) => [...prev, ...imagesToUpload]);

                for (const att of imagesToUpload) {
                    try {
                        const { publicUrl } = await uploadImage(att.file);

                        setImageAttachments((prev) =>
                            prev.map((p) =>
                                p.id === att.id
                                    ? { ...p, uploading: false, publicUrl }
                                    : p,
                            ),
                        );
                    } catch (error: any) {
                        toast.error(
                            `图片上传失败: ${error.message || "未知错误"}`,
                        );
                        setImageAttachments((prev) =>
                            prev.filter((p) => p.id !== att.id),
                        );
                    }
                }
            }

            if (textsToRead.length > 0) {
                for (const file of textsToRead) {
                    try {
                        const content = await file.text();
                        const language = getLanguageFromFilename(file.name);

                        setFileAttachments((prev) => [
                            ...prev,
                            { filename: file.name, content, language },
                        ]);
                    } catch (error: any) {
                        toast.error(`读取文件失败: ${file.name}`);
                    }
                }
            }

            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const removeImageAttachment = (id: string) => {
        setImageAttachments((prev) => prev.filter((a) => a.id !== id));
    };

    const removeFileAttachment = (filename: string) => {
        setFileAttachments((prev) =>
            prev.filter((a) => a.filename !== filename),
        );
    };

    const resetAttachments = () => {
        setImageAttachments([]);
        setFileAttachments([]);
    };

    const isUploading = imageAttachments.some((a) => a.uploading);
    const uploadedImageUrls = imageAttachments
        .map((a) => a.publicUrl)
        .filter((url): url is string => !!url);

    return {
        fileInputRef,
        imageAttachments,
        fileAttachments,
        isUploading,
        uploadedImageUrls,
        handleUploadClick,
        handleFileChange,
        removeImageAttachment,
        removeFileAttachment,
        resetAttachments,
    };
};

