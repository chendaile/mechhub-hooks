import { useEffect, useState } from "react";

export const useSubmitFileState = () => {
    const [file, setFile] = useState<File>();
    const [fileName, setFileName] = useState<string>();
    const [fileUrl, setFileUrl] = useState<string>();

    useEffect(() => {
        if (!file) {
            setFileUrl(undefined);
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setFileUrl(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [file]);

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        setFileName(selectedFile.name);
    };

    return {
        state: {
            file,
            fileName,
            fileUrl,
        },
        actions: {
            handleFileSelect,
            setFile,
        },
    };
};
