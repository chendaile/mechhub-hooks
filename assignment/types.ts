export type AssignmentSubmissionStatus = "pending" | "graded";

export interface AssignmentStudentSubmission {
    id: string;
    studentName: string;
    submittedDate: string;
    status: AssignmentSubmissionStatus;
    submission: string;
}

export type AssignmentScoreColor = "green" | "yellow" | "red";

export interface AssignmentGradeBreakdown {
    category: string;
    score: number;
    maxScore: number;
    color: AssignmentScoreColor;
}

export type AssignmentInsightType = "success" | "warning" | "error";

export interface AssignmentKeyInsight {
    title: string;
    description: string;
    type: AssignmentInsightType;
}
