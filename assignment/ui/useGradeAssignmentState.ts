import { useEffect, useState } from "react";
import type { AssignmentStudentSubmission } from "../types";

interface UseGradeAssignmentStateParams {
    students: AssignmentStudentSubmission[];
    onSaveGrade: (
        studentId: string,
        score: number,
        feedback: string,
    ) => Promise<void>;
}

const MAX_SCORE = 100;

export const useGradeAssignmentState = ({
    students,
    onSaveGrade,
}: UseGradeAssignmentStateParams) => {
    const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
    const [scores, setScores] = useState<Record<string, number>>({});
    const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setCurrentStudentIndex((prevIndex) => {
            if (students.length === 0) {
                return 0;
            }
            return Math.min(prevIndex, students.length - 1);
        });
    }, [students.length]);

    const currentStudent = students[currentStudentIndex];
    const currentStudentId = currentStudent?.id;
    const score = currentStudentId ? scores[currentStudentId] ?? 0 : 0;
    const feedback = currentStudentId ? feedbacks[currentStudentId] ?? "" : "";

    const handleScoreChange = (nextScore: number) => {
        if (!currentStudentId) {
            return;
        }

        const safeScore = Math.min(Math.max(nextScore, 0), MAX_SCORE);
        setScores((prevScores) => ({
            ...prevScores,
            [currentStudentId]: safeScore,
        }));
    };

    const handleFeedbackChange = (nextFeedback: string) => {
        if (!currentStudentId) {
            return;
        }

        setFeedbacks((prevFeedbacks) => ({
            ...prevFeedbacks,
            [currentStudentId]: nextFeedback,
        }));
    };

    const handleSaveGrade = async () => {
        if (!currentStudentId) {
            return;
        }

        try {
            setIsLoading(true);
            await onSaveGrade(currentStudentId, score, feedback);
            if (currentStudentIndex < students.length - 1) {
                setCurrentStudentIndex((prevIndex) => prevIndex + 1);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrevStudent = () => {
        setCurrentStudentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    };

    const handleNextStudent = () => {
        if (students.length === 0) {
            return;
        }

        setCurrentStudentIndex((prevIndex) =>
            Math.min(prevIndex + 1, students.length - 1),
        );
    };

    return {
        currentStudentIndex,
        currentStudent,
        score,
        feedback,
        maxScore: MAX_SCORE,
        isLoading,
        handleScoreChange,
        handleFeedbackChange,
        handleSaveGrade,
        handlePrevStudent,
        handleNextStudent,
    };
};
