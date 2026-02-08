import { useState } from "react";

export const useImagePreviewState = () => {
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const openPreview = (url: string) => setPreviewImage(url);
    const closePreview = () => setPreviewImage(null);

    return {
        previewImage,
        openPreview,
        closePreview,
    };
};
