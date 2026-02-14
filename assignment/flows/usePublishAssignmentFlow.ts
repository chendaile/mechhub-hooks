import { useState } from "react";

interface UsePublishAssignmentFlowParams {
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

interface PublishDraft {
    assignmentName: string;
    selectedModule: string;
    dueDate: string;
    dueTime: string;
    instructions: string;
    attachedFiles: File[];
    aiGradingEnabled: boolean;
}

export const usePublishAssignmentFlow = ({
    onPublish,
}: UsePublishAssignmentFlowParams) => {
    const [isLoading, setIsLoading] = useState(false);

    const handlePublish = async (draft: PublishDraft) => {
        if (!draft.assignmentName.trim() || !draft.selectedModule) {
            return;
        }

        try {
            setIsLoading(true);
            await onPublish(
                draft.assignmentName.trim(),
                draft.selectedModule,
                draft.dueDate,
                draft.dueTime,
                draft.instructions.trim(),
                draft.attachedFiles,
                draft.aiGradingEnabled,
            );
        } finally {
            setIsLoading(false);
        }
    };

    return {
        state: {
            isLoading,
        },
        actions: {
            handlePublish,
        },
    };
};
