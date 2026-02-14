import { useEffect, useMemo, useRef, useState } from "react";
import type { ActiveView } from "../../app/types/view";
import type {
    SidebarActionAudience,
    SidebarAssignmentAction,
    SidebarAssignmentActionViewKey,
} from "../model/sidebarSessionModel";

interface UseSidebarFooterStateParams {
    activeView: ActiveView;
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
    activeView,
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

    const isAssignmentsActive = useMemo(
        () => assignmentActions.some((action) => action.key === activeView),
        [activeView, assignmentActions],
    );
    const previousIsAssignmentsActiveRef = useRef(isAssignmentsActive);

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

    useEffect(() => {
        const wasAssignmentsActive = previousIsAssignmentsActiveRef.current;
        if (!wasAssignmentsActive && isAssignmentsActive) {
            setIsAssignmentsOpen(true);
        }
        previousIsAssignmentsActiveRef.current = isAssignmentsActive;
    }, [isAssignmentsActive]);

    const handleToggleAssignmentsOpen = () => {
        setIsAssignmentsOpen((previous) => !previous);
    };

    const state = {
        isAssignmentsOpen,
        isAssignmentsActive,
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
        isAssignmentsActive: state.isAssignmentsActive,
        handleToggleAssignmentsOpen: actions.handleToggleAssignmentsOpen,
    };
};
