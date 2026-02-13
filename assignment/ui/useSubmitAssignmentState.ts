import { useEffect, useState } from "react";

interface UseSubmitAssignmentStateParams {
    onSubmit: (file: File, comments: string) => Promise<void>;
}

export const useSubmitAssignmentState = ({
    onSubmit,
}: UseSubmitAssignmentStateParams) => {
    const [file, setFile] = useState<File>();
    const [fileName, setFileName] = useState<string>();
    const [fileUrl, setFileUrl] = useState<string>();
    const [comments, setComments] = useState("");
    const [isLoading, setIsLoading] = useState(false);

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

    const handleSubmit = async () => {
        if (!file) {
            return;
        }

        try {
            setIsLoading(true);
            await onSubmit(file, comments);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        fileName,
        fileUrl,
        comments,
        isLoading,
        handleFileSelect,
        setComments,
        handleSubmit,
    };
};
