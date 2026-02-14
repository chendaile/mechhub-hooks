import { useMemo, useState } from "react";
import type {
    SidebarActionAudience,
    SidebarAssignmentAction,
    SidebarAssignmentActionViewKey,
} from "../model/sidebarSessionModel";

interface UseSidebarFooterStateParams {
    onSubmitAssignment?: () => void;
    onViewFeedback?: () => void;
    onPublishAssignment?: () => void;
    onGradeAssignment?: () => void;
}

interface AssignmentCandidate {
    key: SidebarAssignmentActionViewKey;
    label: string;
    audience: SidebarActionAudience;
    onClick?: () => void;
}

export const useSidebarFooterState = ({
    onSubmitAssignment,
    onViewFeedback,
    onPublishAssignment,
    onGradeAssignment,
}: UseSidebarFooterStateParams) => {
    const [isAssignmentsOpen, setIsAssignmentsOpen] = useState(false);

    const assignmentActions = useMemo<SidebarAssignmentAction[]>(() => {
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
            (action): action is SidebarAssignmentAction =>
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

    const state = {
        isAssignmentsOpen,
    };

    const actions = {
        handleToggleAssignmentsOpen,
    };

    const derived = {
        assignmentActions,
        assignmentsTitle,
    };

    return {
        state,
        actions,
        derived,
        assignmentActions: derived.assignmentActions,
        assignmentsTitle: derived.assignmentsTitle,
        isAssignmentsOpen: state.isAssignmentsOpen,
        handleToggleAssignmentsOpen: actions.handleToggleAssignmentsOpen,
    };
};
