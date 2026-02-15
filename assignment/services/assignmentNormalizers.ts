import type {
    Assignment,
    AssignmentAttachment,
    AssignmentDashboardItem,
    AssignmentDashboardSubmission,
    AssignmentFeedbackSummary,
    AssignmentGrade,
    AssignmentSubmission,
    AssignmentStatus,
} from "../types";

type RawRecord = Record<string, unknown>;

const getString = (row: RawRecord, camel: string, snake?: string) => {
    const value = row[camel] ?? (snake ? row[snake] : undefined);
    return typeof value === "string" ? value : "";
};

const getNullableString = (row: RawRecord, camel: string, snake?: string) => {
    const value = row[camel] ?? (snake ? row[snake] : undefined);
    return typeof value === "string" ? value : null;
};

const getNumber = (row: RawRecord, camel: string, snake?: string) => {
    const value = row[camel] ?? (snake ? row[snake] : undefined);
    return typeof value === "number" && Number.isFinite(value) ? value : 0;
};

const getBoolean = (row: RawRecord, camel: string, snake?: string) => {
    const value = row[camel] ?? (snake ? row[snake] : undefined);
    return typeof value === "boolean" ? value : Boolean(value);
};

const normalizeAttachment = (value: unknown): AssignmentAttachment | null => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null;
    }

    const record = value as RawRecord;
    const name = typeof record.name === "string" ? record.name : "";
    const url = typeof record.url === "string" ? record.url : "";

    if (!name || !url) {
        return null;
    }

    const sizeRaw = record.size;
    const size =
        typeof sizeRaw === "number" && Number.isFinite(sizeRaw) && sizeRaw >= 0
            ? sizeRaw
            : undefined;
    const contentType =
        typeof record.contentType === "string" ? record.contentType : undefined;
    const storagePath =
        typeof record.storagePath === "string" ? record.storagePath : undefined;

    return {
        name,
        url,
        ...(size !== undefined ? { size } : {}),
        ...(contentType ? { contentType } : {}),
        ...(storagePath ? { storagePath } : {}),
    };
};

const normalizeAssignmentStatus = (value: unknown): AssignmentStatus =>
    value === "draft" || value === "published" || value === "closed"
        ? value
        : "published";

export const normalizeAssignmentGrade = (value: unknown): AssignmentGrade => {
    const row = (value ?? {}) as RawRecord;

    return {
        id: getString(row, "id"),
        submissionId: getString(row, "submissionId", "submission_id"),
        graderUserId: getString(row, "graderUserId", "grader_user_id"),
        score: getNumber(row, "score"),
        maxScore: getNumber(row, "maxScore", "max_score") || 100,
        rubric:
            row.rubric && typeof row.rubric === "object" ? row.rubric : [],
        teacherFeedback:
            getString(row, "teacherFeedback", "teacher_feedback") || "",
        aiFeedbackDraft: getNullableString(
            row,
            "aiFeedbackDraft",
            "ai_feedback_draft",
        ),
        status: row.status === "released" ? "released" : "draft",
        gradedAt: getString(row, "gradedAt", "graded_at"),
        releasedAt: getNullableString(row, "releasedAt", "released_at"),
        createdAt: getString(row, "createdAt", "created_at") || undefined,
        updatedAt: getString(row, "updatedAt", "updated_at") || undefined,
    };
};

export const normalizeAssignmentSubmission = (
    value: unknown,
): AssignmentSubmission => {
    const row = (value ?? {}) as RawRecord;
    const rawSnapshot = row.evidenceSnapshot ?? row.evidence_snapshot;

    return {
        id: getString(row, "id"),
        assignmentId: getString(row, "assignmentId", "assignment_id"),
        classId: getString(row, "classId", "class_id"),
        studentUserId: getString(row, "studentUserId", "student_user_id"),
        attemptNo: getNumber(row, "attemptNo", "attempt_no") || 1,
        sourceKind:
            row.sourceKind === "chat_response_snapshot" ||
            row.source_kind === "chat_response_snapshot"
                ? "chat_response_snapshot"
                : "chat_session_snapshot",
        sourceChatId: getNullableString(row, "sourceChatId", "source_chat_id"),
        sourceMessageId: getNullableString(
            row,
            "sourceMessageId",
            "source_message_id",
        ),
        evidenceSnapshot:
            rawSnapshot &&
            typeof rawSnapshot === "object" &&
            !Array.isArray(rawSnapshot)
                ? (rawSnapshot as Record<string, unknown>)
                : {},
        reflectionText: getNullableString(
            row,
            "reflectionText",
            "reflection_text",
        ),
        submittedAt: getString(row, "submittedAt", "submitted_at"),
        status:
            row.status === "graded" || row.status === "returned"
                ? row.status
                : "submitted",
        createdAt: getString(row, "createdAt", "created_at") || undefined,
        updatedAt: getString(row, "updatedAt", "updated_at") || undefined,
        studentName: getString(row, "studentName", "student_name") || undefined,
        studentEmail:
            getString(row, "studentEmail", "student_email") || undefined,
        studentAvatar: getNullableString(
            row,
            "studentAvatar",
            "student_avatar",
        ),
        grade: row.grade ? normalizeAssignmentGrade(row.grade) : null,
    };
};

export const normalizeAssignment = (value: unknown): Assignment => {
    const row = (value ?? {}) as RawRecord;
    const rawAttachments = Array.isArray(row.attachments)
        ? row.attachments
        : [];

    return {
        id: getString(row, "id"),
        classId: getString(row, "classId", "class_id"),
        title: getString(row, "title") || "Untitled Assignment",
        instructions: getNullableString(row, "instructions"),
        dueAt: getNullableString(row, "dueAt", "due_at"),
        attachments: rawAttachments
            .map(normalizeAttachment)
            .filter((item): item is AssignmentAttachment => !!item),
        createdByUserId: getString(row, "createdByUserId", "created_by_user_id"),
        aiGradingEnabled: getBoolean(
            row,
            "aiGradingEnabled",
            "ai_grading_enabled",
        ),
        status: normalizeAssignmentStatus(row.status),
        createdAt: getString(row, "createdAt", "created_at"),
        updatedAt: getString(row, "updatedAt", "updated_at"),
        submissionCount: getNumber(row, "submissionCount", "submission_count"),
        latestSubmission: row.latest_submission
            ? normalizeAssignmentSubmission(row.latest_submission)
            : null,
        latestGrade: row.latest_grade
            ? normalizeAssignmentGrade(row.latest_grade)
            : null,
    };
};

export const normalizeAssignmentDashboardSubmission = (
    value: unknown,
): AssignmentDashboardSubmission => {
    const row = (value ?? {}) as RawRecord;

    const gradeStatusRaw = row.gradeStatus ?? row.grade_status;
    const gradeStatus =
        gradeStatusRaw === "released" || gradeStatusRaw === "draft"
            ? gradeStatusRaw
            : null;

    return {
        submissionId: getString(row, "submissionId", "submission_id"),
        assignmentId: getString(row, "assignmentId", "assignment_id"),
        studentUserId: getString(row, "studentUserId", "student_user_id"),
        studentName: getString(row, "studentName", "student_name"),
        submittedAt: getString(row, "submittedAt", "submitted_at"),
        gradeStatus,
        aiFeedbackDraft: getNullableString(
            row,
            "aiFeedbackDraft",
            "ai_feedback_draft",
        ),
    };
};

export const normalizeAssignmentDashboardItem = (
    value: unknown,
): AssignmentDashboardItem => {
    const row = (value ?? {}) as RawRecord;
    const rawSubmissions = Array.isArray(row.submissions)
        ? row.submissions
        : [];

    return {
        assignment: normalizeAssignment(row.assignment),
        submissions: rawSubmissions
            .map(normalizeAssignmentDashboardSubmission)
            .filter((submission) => submission.assignmentId),
    };
};

export const normalizeAssignmentFeedbackSummary = (
    value: unknown,
): AssignmentFeedbackSummary => {
    const row = (value ?? {}) as RawRecord;

    return {
        assignment: row.assignment ? normalizeAssignment(row.assignment) : null,
        submission: normalizeAssignmentSubmission(row.submission),
        grade: row.grade ? normalizeAssignmentGrade(row.grade) : null,
    };
};
