import type {
    Assignment,
    AssignmentFeedbackDetail,
    AssignmentFeedbackSummary,
    AssignmentDashboardItem,
    AssignmentSubmission,
    CreateAssignmentPayload,
    GenerateGradeDraftPayload,
    ReleaseGradePayload,
    SaveGradeReviewPayload,
    SubmitAssignmentFromChatPayload,
} from "../types";
import {
    normalizeAssignment,
    normalizeAssignmentDashboardItem,
    normalizeAssignmentFeedbackSummary,
    normalizeAssignmentGrade,
    normalizeAssignmentSubmission,
} from "./assignmentNormalizers";
import { invokeAssignmentCore } from "./assignmentTransport";

export const createAssignment = async (
    payload: CreateAssignmentPayload,
): Promise<Assignment> => {
    const result = await invokeAssignmentCore<{ assignment?: unknown }>({
        action: "create_assignment",
        class_id: payload.classId,
        title: payload.title,
        instructions: payload.instructions ?? "",
        due_at: payload.dueAt ?? null,
        ai_grading_enabled: payload.aiGradingEnabled ?? true,
        status: payload.status ?? "published",
        attachments: payload.attachments ?? [],
    });

    return normalizeAssignment(result.assignment);
};

export const listMyAssignments = async (
    classId?: string,
): Promise<Assignment[]> => {
    const result = await invokeAssignmentCore<{ assignments?: unknown[] }>({
        action: "list_my_assignments",
        class_id: classId ?? "",
    });

    return Array.isArray(result.assignments)
        ? result.assignments
              .map(normalizeAssignment)
              .filter((assignment) => assignment.id)
        : [];
};

export const listClassAssignments = async (
    classId: string,
): Promise<Assignment[]> => {
    const result = await invokeAssignmentCore<{ assignments?: unknown[] }>({
        action: "list_class_assignments",
        class_id: classId,
    });

    return Array.isArray(result.assignments)
        ? result.assignments
              .map(normalizeAssignment)
              .filter((assignment) => assignment.id)
        : [];
};

export const listClassAssignmentDashboard = async (
    classId: string,
): Promise<AssignmentDashboardItem[]> => {
    const result = await invokeAssignmentCore<{ assignments?: unknown[] }>({
        action: "list_class_assignment_dashboard",
        class_id: classId,
    });

    return Array.isArray(result.assignments)
        ? result.assignments
              .map(normalizeAssignmentDashboardItem)
              .filter((item) => item.assignment.id)
        : [];
};

export const submitAssignmentFromChat = async (
    payload: SubmitAssignmentFromChatPayload,
): Promise<AssignmentSubmission> => {
    const result = await invokeAssignmentCore<{ submission?: unknown }>({
        action: "submit_assignment_from_chat",
        assignment_id: payload.assignmentId,
        class_id: payload.classId,
        source_kind: payload.sourceKind,
        source_chat_id: payload.sourceChatId,
        source_message_id: payload.sourceMessageId ?? "",
        reflection_text: payload.reflectionText ?? "",
    });

    return normalizeAssignmentSubmission(result.submission);
};

export const listAssignmentSubmissions = async (payload: {
    assignmentId: string;
    classId?: string;
}): Promise<{ assignment: Assignment | null; submissions: AssignmentSubmission[] }> => {
    const result = await invokeAssignmentCore<{
        assignment?: unknown;
        submissions?: unknown[];
    }>({
        action: "list_assignment_submissions",
        assignment_id: payload.assignmentId,
        class_id: payload.classId ?? "",
    });

    return {
        assignment: result.assignment ? normalizeAssignment(result.assignment) : null,
        submissions: Array.isArray(result.submissions)
            ? result.submissions
                  .map(normalizeAssignmentSubmission)
                  .filter((submission) => submission.id)
            : [],
    };
};

export const generateGradeDraft = async (
    payload: GenerateGradeDraftPayload,
) => {
    const result = await invokeAssignmentCore<{
        grade?: unknown;
        submission_id?: string;
    }>({
        action: "generate_grade_draft",
        submission_id: payload.submissionId,
        model: payload.model ?? "",
    });

    return {
        grade: normalizeAssignmentGrade(result.grade),
        submissionId:
            typeof result.submission_id === "string"
                ? result.submission_id
                : payload.submissionId,
    };
};

export const saveGradeReview = async (
    payload: SaveGradeReviewPayload,
) => {
    const result = await invokeAssignmentCore<{
        grade?: unknown;
        submission_id?: string;
    }>({
        action: "save_grade_review",
        submission_id: payload.submissionId,
        score: payload.score,
        max_score: payload.maxScore,
        teacher_feedback: payload.teacherFeedback,
        rubric: payload.rubric ?? [],
        ai_feedback_draft: payload.aiFeedbackDraft ?? null,
    });

    return {
        grade: normalizeAssignmentGrade(result.grade),
        submissionId:
            typeof result.submission_id === "string"
                ? result.submission_id
                : payload.submissionId,
    };
};

export const releaseGrade = async (payload: ReleaseGradePayload) => {
    const result = await invokeAssignmentCore<{
        success?: boolean;
        submission_id?: string;
        grade?: unknown;
    }>({
        action: "release_grade",
        submission_id: payload.submissionId,
    });

    return {
        success: result.success === true,
        submissionId:
            typeof result.submission_id === "string"
                ? result.submission_id
                : payload.submissionId,
        grade: result.grade ? normalizeAssignmentGrade(result.grade) : null,
    };
};

export const listMyFeedback = async (
    classId?: string,
): Promise<AssignmentFeedbackSummary[]> => {
    const result = await invokeAssignmentCore<{ feedback?: unknown[] }>({
        action: "list_my_feedback",
        class_id: classId ?? "",
    });

    return Array.isArray(result.feedback)
        ? result.feedback
              .map(normalizeAssignmentFeedbackSummary)
              .filter((item) => item.submission.id)
        : [];
};

export const getFeedbackDetail = async (
    submissionId: string,
): Promise<AssignmentFeedbackDetail> => {
    const result = await invokeAssignmentCore<{
        assignment?: unknown;
        submission?: unknown;
        grade?: unknown;
    }>({
        action: "get_feedback_detail",
        submission_id: submissionId,
    });

    return {
        assignment: result.assignment ? normalizeAssignment(result.assignment) : null,
        submission: normalizeAssignmentSubmission(result.submission),
        grade: result.grade ? normalizeAssignmentGrade(result.grade) : null,
    };
};
