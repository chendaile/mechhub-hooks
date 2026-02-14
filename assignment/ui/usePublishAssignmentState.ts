import { usePublishAssignmentFileState } from "../states/usePublishAssignmentFileState";
import { usePublishAssignmentFlow } from "../flows/usePublishAssignmentFlow";
import { usePublishAssignmentFormState } from "../states/usePublishAssignmentFormState";

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
    const form = usePublishAssignmentFormState();
    const files = usePublishAssignmentFileState();
    const flow = usePublishAssignmentFlow({ onPublish });

    const handlePublish = async () => {
        await flow.actions.handlePublish({
            assignmentName: form.state.assignmentName,
            selectedModule: form.state.selectedModule,
            dueDate: form.state.dueDate,
            dueTime: form.state.dueTime,
            instructions: form.state.instructions,
            attachedFiles: files.state.attachedFiles,
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
        assignmentName: state.assignmentName,
        setAssignmentName: actions.setAssignmentName,
        selectedModule: state.selectedModule,
        setSelectedModule: actions.setSelectedModule,
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
