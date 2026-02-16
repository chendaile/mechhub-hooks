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

export interface AssignmentAttachment {
    name: string;
    url: string;
    size?: number;
    contentType?: string;
    storagePath?: string;
}

export type SubmissionSourceKind =
    | "chat_session_snapshot"
    | "chat_response_snapshot";

export type AssignmentStatus = "draft" | "published" | "closed";

export type AssignmentSubmissionRecordStatus =
    | "submitted"
    | "graded"
    | "returned";

export type AssignmentGradeStatus = "draft" | "released";

export interface Assignment {
    id: string;
    classId: string;
    title: string;
    instructions: string | null;
    dueAt: string | null;
    attachments?: AssignmentAttachment[];
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

export interface AssignmentDashboardSubmission {
    submissionId: string;
    assignmentId: string;
    studentUserId: string;
    studentName: string;
    submittedAt: string;
    gradeStatus: AssignmentGradeStatus | null;
    aiFeedbackDraft: string | null;
}

export interface AssignmentDashboardItem {
    assignment: Assignment;
    submissions: AssignmentDashboardSubmission[];
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

export interface PublishAssignmentDraft {
    title: string;
    classId: string;
    dueDate: string;
    dueTime: string;
    instructions: string;
    files: File[];
    aiGradingEnabled: boolean;
}

export interface CreateAssignmentPayload {
    classId: string;
    title: string;
    instructions?: string;
    dueAt?: string | null;
    aiGradingEnabled?: boolean;
    status?: AssignmentStatus;
    attachments?: AssignmentAttachment[];
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
