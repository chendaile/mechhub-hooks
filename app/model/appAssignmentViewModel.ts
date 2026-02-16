import type {
    Assignment,
    AssignmentAttachment,
    AssignmentFeedbackSummary,
    AssignmentGrade,
} from "../../assignment/public";

export interface AssignmentClassNameMap {
    [classId: string]: string;
}

export interface SubmitAssignmentViewModel {
    id: string;
    title: string;
    className: string;
    dueAt: string | null;
    instructions: string | null;
    attachments: AssignmentAttachment[];
    status: "pending" | "submitted" | "overdue";
    latestAttemptNo: number;
    latestSubmittedAt: string | null;
    latestGrade: string | null;
    latestEvidenceSnapshot?: Record<string, unknown>;
    latestSubmissionId?: string;
}

export interface ViewFeedbackGroupItem {
    submissionId: string;
    assignmentTitle: string;
    classId: string;
    className: string;
}

export interface ViewFeedbackGroup {
    classId: string;
    className: string;
    items: ViewFeedbackGroupItem[];
}

const DEFAULT_CLASS_NAME = "未命名班级";
const DEFAULT_ASSIGNMENT_NAME = "未命名作业";

const resolveAssignmentStatus = (
    assignment: Assignment,
): SubmitAssignmentViewModel["status"] => {
    const dueAt = assignment.dueAt ? new Date(assignment.dueAt) : null;
    const isOverdue = !!dueAt && dueAt.getTime() < Date.now();
    const hasSubmission = !!assignment.latestSubmission;

    if (isOverdue && !hasSubmission) {
        return "overdue";
    }

    return hasSubmission ? "submitted" : "pending";
};

const toDisplayGrade = (grade: AssignmentGrade | null | undefined) => {
    if (!grade) {
        return null;
    }

    return `${grade.score}/${grade.maxScore}`;
};

const resolveFeedbackClassId = (feedback: AssignmentFeedbackSummary) =>
    feedback.assignment?.classId || feedback.submission.classId || "unknown";

export const buildAssignmentClassNameMap = (
    classOptions: Array<{ id: string; name: string }>,
): AssignmentClassNameMap =>
    Object.fromEntries(
        classOptions.map((classItem) => [classItem.id, classItem.name]),
    );

export const buildSubmitAssignmentViewModel = (
    assignments: Assignment[],
    classNameById: AssignmentClassNameMap,
): SubmitAssignmentViewModel[] =>
    assignments.map((assignment) => ({
        id: assignment.id,
        title: assignment.title,
        className: classNameById[assignment.classId] ?? DEFAULT_CLASS_NAME,
        dueAt: assignment.dueAt,
        instructions: assignment.instructions,
        attachments: assignment.attachments ?? [],
        status: resolveAssignmentStatus(assignment),
        latestAttemptNo: assignment.latestSubmission?.attemptNo ?? 0,
        latestSubmittedAt: assignment.latestSubmission?.submittedAt ?? null,
        latestGrade: toDisplayGrade(assignment.latestGrade),
        latestEvidenceSnapshot:
            assignment.latestSubmission?.evidenceSnapshot ?? undefined,
        latestSubmissionId: assignment.latestSubmission?.id,
    }));

export const buildViewFeedbackGroups = (
    feedbackList: AssignmentFeedbackSummary[],
    classNameById: AssignmentClassNameMap,
): ViewFeedbackGroup[] => {
    const groups = new Map<string, ViewFeedbackGroup>();

    feedbackList.forEach((feedback) => {
        const classId = resolveFeedbackClassId(feedback);
        const className = classNameById[classId] ?? DEFAULT_CLASS_NAME;

        const currentGroup = groups.get(classId);
        const nextItem: ViewFeedbackGroupItem = {
            submissionId: feedback.submission.id,
            assignmentTitle:
                feedback.assignment?.title ?? DEFAULT_ASSIGNMENT_NAME,
            classId,
            className,
        };

        if (!currentGroup) {
            groups.set(classId, {
                classId,
                className,
                items: [nextItem],
            });
            return;
        }

        currentGroup.items.push(nextItem);
    });

    return Array.from(groups.values());
};
