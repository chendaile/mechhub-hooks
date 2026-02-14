import { useState } from "react";

const MAX_SCORE = 100;

export const useGradeDraftState = () => {
    const [scores, setScores] = useState<Record<string, number>>({});
    const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});

    const deriveGradeDraft = (studentId?: string) => ({
        score: studentId ? (scores[studentId] ?? 0) : 0,
        feedback: studentId ? (feedbacks[studentId] ?? "") : "",
    });

    const handleScoreChange = (
        studentId: string | undefined,
        nextScore: number,
    ) => {
        if (!studentId) {
            return;
        }

        const safeScore = Math.min(Math.max(nextScore, 0), MAX_SCORE);
        setScores((previousScores) => ({
            ...previousScores,
            [studentId]: safeScore,
        }));
    };

    const handleFeedbackChange = (
        studentId: string | undefined,
        nextFeedback: string,
    ) => {
        if (!studentId) {
            return;
        }

        setFeedbacks((previousFeedbacks) => ({
            ...previousFeedbacks,
            [studentId]: nextFeedback,
        }));
    };

    return {
        state: {
            scores,
            feedbacks,
            maxScore: MAX_SCORE,
        },
        actions: {
            handleScoreChange,
            handleFeedbackChange,
        },
        derived: {
            deriveGradeDraft,
        },
    };
};
