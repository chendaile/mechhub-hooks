import { useState } from "react";

interface UsePublishAssignmentStateParams {
    onPublish: (
        name: string,
        module: string,
        dueDate: string,
        dueTime: string,
        instructions: string,
        files: File[],
        aiGradingEnabled: boolean,
    ) => Promise<void>;
}

export const usePublishAssignmentState = ({
    onPublish,
}: UsePublishAssignmentStateParams) => {
    const [assignmentName, setAssignmentName] = useState("");
    const [selectedModule, setSelectedModule] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [dueTime, setDueTime] = useState("");
    const [instructions, setInstructions] = useState("");
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const [aiGradingEnabled, setAiGradingEnabled] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileUpload = (file: File) => {
        setAttachedFiles((prevFiles) => [...prevFiles, file]);
    };

    const handleRemoveFile = (index: number) => {
        setAttachedFiles((prevFiles) =>
            prevFiles.filter((_, itemIndex) => itemIndex !== index),
        );
    };

    const handlePublish = async () => {
        if (!assignmentName.trim() || !selectedModule) {
            return;
        }

        try {
            setIsLoading(true);
            await onPublish(
                assignmentName.trim(),
                selectedModule,
                dueDate,
                dueTime,
                instructions.trim(),
                attachedFiles,
                aiGradingEnabled,
            );
        } finally {
            setIsLoading(false);
        }
    };

    return {
        assignmentName,
        setAssignmentName,
        selectedModule,
        setSelectedModule,
        dueDate,
        setDueDate,
        dueTime,
        setDueTime,
        instructions,
        setInstructions,
        attachedFiles,
        aiGradingEnabled,
        setAiGradingEnabled,
        isLoading,
        handleFileUpload,
        handleRemoveFile,
        handlePublish,
    };
};
