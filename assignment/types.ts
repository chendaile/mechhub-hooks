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

export type SubmissionSourceKind =
    | "chat_session_snapshot"
    | "chat_response_snapshot";

export type AssignmentStatus = "draft" | "published" | "closed";

export type AssignmentSubmissionRecordStatus = "submitted" | "graded" | "returned";

export type AssignmentGradeStatus = "draft" | "released";

export interface Assignment {
    id: string;
    classId: string;
    title: string;
    instructions: string | null;
    dueAt: string | null;
    createdByUserId: string;
    aiGradingEnabled: boolean;
    status: AssignmentStatus;
    createdAt: string;
    updatedAt: string;
    submissionCount?: number;
    latestSubmission?: AssignmentSubmission | null;
    latestGrade?: AssignmentGrade | null;
}

export interface AssignmentSubmission {
    id: string;
    assignmentId: string;
    classId: string;
    studentUserId: string;
    attemptNo: number;
    sourceKind: SubmissionSourceKind;
    sourceChatId: string | null;
    sourceMessageId: string | null;
    evidenceSnapshot: Record<string, unknown>;
    reflectionText: string | null;
    submittedAt: string;
    status: AssignmentSubmissionRecordStatus;
    createdAt?: string;
    updatedAt?: string;
    studentName?: string;
    studentEmail?: string;
    studentAvatar?: string | null;
    grade?: AssignmentGrade | null;
}

export interface AssignmentGrade {
    id: string;
    submissionId: string;
    graderUserId: string;
    score: number;
    maxScore: number;
    rubric: unknown;
    teacherFeedback: string;
    aiFeedbackDraft: string | null;
    status: AssignmentGradeStatus;
    gradedAt: string;
    releasedAt: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface AssignmentFeedbackSummary {
    assignment: Assignment | null;
    submission: AssignmentSubmission;
    grade: AssignmentGrade | null;
}

export interface AssignmentFeedbackDetail {
    assignment: Assignment | null;
    submission: AssignmentSubmission;
    grade: AssignmentGrade | null;
}

export interface CreateAssignmentPayload {
    classId: string;
    title: string;
    instructions?: string;
    dueAt?: string | null;
    aiGradingEnabled?: boolean;
    status?: AssignmentStatus;
}

export interface SubmitAssignmentFromChatPayload {
    assignmentId: string;
    classId: string;
    sourceKind: SubmissionSourceKind;
    sourceChatId: string;
    sourceMessageId?: string;
    reflectionText?: string;
}

export interface GenerateGradeDraftPayload {
    submissionId: string;
    model?: string;
}

export interface SaveGradeReviewPayload {
    submissionId: string;
    score: number;
    maxScore: number;
    teacherFeedback: string;
    rubric?: unknown;
    aiFeedbackDraft?: string | null;
}

export interface ReleaseGradePayload {
    submissionId: string;
}
