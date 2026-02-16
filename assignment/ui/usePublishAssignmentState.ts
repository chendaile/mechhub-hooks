import { usePublishAssignmentFileState } from "../states/usePublishAssignmentFileState";
import { usePublishAssignmentFlow } from "../flows/usePublishAssignmentFlow";
import { usePublishAssignmentFormState } from "../states/usePublishAssignmentFormState";
import type { PublishAssignmentDraft } from "../types";

interface UsePublishAssignmentStateParams {
    onPublish: (draft: PublishAssignmentDraft) => Promise<void>;
}

export const usePublishAssignmentState = ({
    onPublish,
}: UsePublishAssignmentStateParams) => {
    const form = usePublishAssignmentFormState();
    const files = usePublishAssignmentFileState();
    const flow = usePublishAssignmentFlow({ onPublish });

    const handlePublish = async () => {
        await flow.actions.handlePublish({
            title: form.state.title,
            classId: form.state.classId,
            dueDate: form.state.dueDate,
            dueTime: form.state.dueTime,
            instructions: form.state.instructions,
            files: files.state.attachedFiles,
            aiGradingEnabled: form.state.aiGradingEnabled,
        });
    };

    const state = {
        ...form.state,
        ...files.state,
        ...flow.state,
    };

    const actions = {
        ...form.actions,
        ...files.actions,
        handlePublish,
    };

    return {
        state,
        actions,
        title: state.title,
        setTitle: actions.setTitle,
        classId: state.classId,
        setClassId: actions.setClassId,
        dueDate: state.dueDate,
        setDueDate: actions.setDueDate,
        dueTime: state.dueTime,
        setDueTime: actions.setDueTime,
        instructions: state.instructions,
        setInstructions: actions.setInstructions,
        attachedFiles: state.attachedFiles,
        aiGradingEnabled: state.aiGradingEnabled,
        setAiGradingEnabled: actions.setAiGradingEnabled,
        isLoading: state.isLoading,
        handleFileUpload: actions.handleFileUpload,
        handleRemoveFile: actions.handleRemoveFile,
        handlePublish: actions.handlePublish,
    };
};
