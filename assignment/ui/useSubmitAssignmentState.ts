import { useSubmitAssignmentFlow } from "../flows/useSubmitAssignmentFlow";
import { useSubmitFileState } from "../states/useSubmitFileState";

interface UseSubmitAssignmentStateParams {
    onSubmit: (file: File, comments: string) => Promise<void>;
}

export const useSubmitAssignmentState = ({
    onSubmit,
}: UseSubmitAssignmentStateParams) => {
    const fileState = useSubmitFileState();
    const submitFlow = useSubmitAssignmentFlow({ onSubmit });

    const handleSubmit = async () => {
        await submitFlow.actions.handleSubmit(fileState.state.file);
    };

    const state = {
        fileName: fileState.state.fileName,
        fileUrl: fileState.state.fileUrl,
        comments: submitFlow.state.comments,
        isLoading: submitFlow.state.isLoading,
    };

    const actions = {
        handleFileSelect: fileState.actions.handleFileSelect,
        setComments: submitFlow.actions.setComments,
        handleSubmit,
    };

    return {
        state,
        actions,
        fileName: state.fileName,
        fileUrl: state.fileUrl,
        comments: state.comments,
        isLoading: state.isLoading,
        handleFileSelect: actions.handleFileSelect,
        setComments: actions.setComments,
        handleSubmit: actions.handleSubmit,
    };
};
