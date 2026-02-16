import type { ReactNode } from "react";
import type { ActiveView } from "../types/view";

export interface AssignmentNoticeCopy {
    title: string;
    description: string;
    actionLabel: string;
}

export interface AssignmentNoticeConfig {
    canAccess: boolean;
    hasMembership: boolean;
    notice: AssignmentNoticeCopy;
    content: ReactNode;
}

export const resolveAssignmentPanelNode = ({
    canAccess,
    hasMembership,
    notice,
    content,
}: AssignmentNoticeConfig):
    | { kind: "hidden" }
    | { kind: "content"; content: ReactNode }
    | { kind: "notice"; notice: AssignmentNoticeCopy } => {
    if (!canAccess) {
        return { kind: "hidden" };
    }

    if (hasMembership) {
        return {
            kind: "content",
            content,
        };
    }

    return {
        kind: "notice",
        notice,
    };
};

export const shouldShowLandingPage = (
    isLoggedIn: boolean,
    activeView: ActiveView,
) => isLoggedIn && activeView === "landing";
