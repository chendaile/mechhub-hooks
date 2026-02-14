import { useState } from "react";

interface UseGradeSubmitFlowParams {
    onSaveGrade: (
        studentId: string,
        score: number,
        feedback: string,
    ) => Promise<void>;
}

interface GradeSubmitPayload {
    studentId?: string;
    score: number;
    feedback: string;
    hasNextStudent: boolean;
    moveToNextStudent: () => void;
}

export const useGradeSubmitFlow = ({
    onSaveGrade,
}: UseGradeSubmitFlowParams) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleSaveGrade = async ({
        studentId,
        score,
        feedback,
        hasNextStudent,
        moveToNextStudent,
    }: GradeSubmitPayload) => {
        if (!studentId) {
            return;
        }

        try {
            setIsLoading(true);
            await onSaveGrade(studentId, score, feedback);

            if (hasNextStudent) {
                moveToNextStudent();
            }
        } finally {
            setIsLoading(false);
        }
    };

    return {
        state: {
            isLoading,
        },
        actions: {
            handleSaveGrade,
        },
    };
};
