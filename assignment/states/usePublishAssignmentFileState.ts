import { useState } from "react";

export const usePublishAssignmentFileState = () => {
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

    const handleFileUpload = (file: File) => {
        setAttachedFiles((previousFiles) => [...previousFiles, file]);
    };

    const handleRemoveFile = (index: number) => {
        setAttachedFiles((previousFiles) =>
            previousFiles.filter((_, itemIndex) => itemIndex !== index),
        );
    };

    return {
        state: {
            attachedFiles,
        },
        actions: {
            handleFileUpload,
            handleRemoveFile,
        },
    };
};
