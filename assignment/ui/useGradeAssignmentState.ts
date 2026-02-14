import { useGradeDraftState } from "../states/useGradeDraftState";
import { useStudentCursorState } from "../states/useStudentCursorState";
import { useGradeSubmitFlow } from "../flows/useGradeSubmitFlow";
import type { AssignmentStudentSubmission } from "../types";

interface UseGradeAssignmentStateParams {
    students: AssignmentStudentSubmission[];
    onSaveGrade: (
        studentId: string,
        score: number,
        feedback: string,
    ) => Promise<void>;
}

export const useGradeAssignmentState = ({
    students,
    onSaveGrade,
}: UseGradeAssignmentStateParams) => {
    const cursor = useStudentCursorState(students);
    const draft = useGradeDraftState();
    const submit = useGradeSubmitFlow({ onSaveGrade });

    const { currentStudentIndex, currentStudent } = cursor.state;
    const currentStudentId = currentStudent?.id;
    const { score, feedback } =
        draft.derived.deriveGradeDraft(currentStudentId);

    const handleSaveGrade = async () => {
        await submit.actions.handleSaveGrade({
            studentId: currentStudentId,
            score,
            feedback,
            hasNextStudent: currentStudentIndex < students.length - 1,
            moveToNextStudent: cursor.actions.handleNextStudent,
        });
    };

    const state = {
        currentStudentIndex,
        currentStudent,
        score,
        feedback,
        maxScore: draft.state.maxScore,
        isLoading: submit.state.isLoading,
    };

    const actions = {
        handleScoreChange: (nextScore: number) =>
            draft.actions.handleScoreChange(currentStudentId, nextScore),
        handleFeedbackChange: (nextFeedback: string) =>
            draft.actions.handleFeedbackChange(currentStudentId, nextFeedback),
        handleSaveGrade,
        handlePrevStudent: cursor.actions.handlePrevStudent,
        handleNextStudent: cursor.actions.handleNextStudent,
    };

    return {
        state,
        actions,
        currentStudentIndex: state.currentStudentIndex,
        currentStudent: state.currentStudent,
        score: state.score,
        feedback: state.feedback,
        maxScore: state.maxScore,
        isLoading: state.isLoading,
        handleScoreChange: actions.handleScoreChange,
        handleFeedbackChange: actions.handleFeedbackChange,
        handleSaveGrade: actions.handleSaveGrade,
        handlePrevStudent: actions.handlePrevStudent,
        handleNextStudent: actions.handleNextStudent,
    };
};
