import { useMemo, useState } from "react";
import type { ActiveView } from "../../app/types/view";

interface UseSidebarFooterStateParams {
    onSubmitAssignment?: () => void;
    onViewFeedback?: () => void;
    onPublishAssignment?: () => void;
    onGradeAssignment?: () => void;
}

export type SidebarFooterActionViewKey = Extract<
    ActiveView,
    | "submitAssignment"
    | "viewFeedback"
    | "publishAssignment"
    | "gradeAssignment"
>;

export type SidebarFooterActionAudience = "student" | "teacher";

export interface SidebarFooterAction {
    key: SidebarFooterActionViewKey;
    label: string;
    audience: SidebarFooterActionAudience;
    onClick: () => void;
}

interface AssignmentCandidate {
    key: SidebarFooterActionViewKey;
    label: string;
    audience: SidebarFooterActionAudience;
    onClick?: () => void;
}

export const useSidebarFooterState = ({
    onSubmitAssignment,
    onViewFeedback,
    onPublishAssignment,
    onGradeAssignment,
}: UseSidebarFooterStateParams) => {
    const [isAssignmentsOpen, setIsAssignmentsOpen] = useState(false);

    const assignmentActions = useMemo<SidebarFooterAction[]>(() => {
        const candidates: AssignmentCandidate[] = [
            {
                key: "submitAssignment",
                label: "Submit",
                audience: "student",
                onClick: onSubmitAssignment,
            },
            {
                key: "viewFeedback",
                label: "Feedback",
                audience: "student",
                onClick: onViewFeedback,
            },
            {
                key: "publishAssignment",
                label: "Publish",
                audience: "teacher",
                onClick: onPublishAssignment,
            },
            {
                key: "gradeAssignment",
                label: "Grade",
                audience: "teacher",
                onClick: onGradeAssignment,
            },
        ];

        return candidates.filter(
            (action): action is SidebarFooterAction =>
                typeof action.onClick === "function",
        );
    }, [
        onSubmitAssignment,
        onViewFeedback,
        onPublishAssignment,
        onGradeAssignment,
    ]);

    const assignmentsTitle = useMemo(() => {
        const hasStudentActions = assignmentActions.some(
            (action) => action.audience === "student",
        );
        const hasTeacherActions = assignmentActions.some(
            (action) => action.audience === "teacher",
        );

        if (hasStudentActions && !hasTeacherActions) {
            return "Assignments (Student)";
        }

        if (!hasStudentActions && hasTeacherActions) {
            return "Assignments (Teacher)";
        }

        return "Assignments";
    }, [assignmentActions]);

    const handleToggleAssignmentsOpen = () => {
        setIsAssignmentsOpen((previous) => !previous);
    };

    return {
        assignmentActions,
        assignmentsTitle,
        isAssignmentsOpen,
        handleToggleAssignmentsOpen,
    };
};
