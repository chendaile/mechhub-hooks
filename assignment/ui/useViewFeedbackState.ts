import type {
    AssignmentGradeBreakdown,
    AssignmentKeyInsight,
} from "../types";

interface UseViewFeedbackStateParams {
    assignmentTitle: string;
    overallScore: number;
    maxScore: number;
    submittedDate: string;
    teacherName: string;
    teacherAvatar?: string;
    teacherSummary: string;
    aiAnalysis: string;
    gradeBreakdown: AssignmentGradeBreakdown[];
    keyInsights: AssignmentKeyInsight[];
    generalComments?: string;
    privateNotes?: string;
    onDownloadPDF?: () => void;
    onShareToClass?: () => void;
}

export const useViewFeedbackState = ({
    assignmentTitle,
    overallScore,
    maxScore,
    submittedDate,
    teacherName,
    teacherAvatar,
    teacherSummary,
    aiAnalysis,
    gradeBreakdown,
    keyInsights,
    generalComments,
    privateNotes,
    onDownloadPDF,
    onShareToClass,
}: UseViewFeedbackStateParams) => {
    const scorePercentage =
        maxScore > 0
            ? Math.max(0, Math.min(100, Math.round((overallScore / maxScore) * 100)))
            : 0;

    return {
        assignmentTitle,
        overallScore,
        maxScore,
        scorePercentage,
        submittedDate,
        teacherName,
        teacherAvatar,
        teacherSummary,
        aiAnalysis,
        gradeBreakdown,
        keyInsights,
        generalComments,
        privateNotes,
        onDownloadPDF,
        onShareToClass,
    };
};
