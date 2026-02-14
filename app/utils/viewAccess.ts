import type { ActiveView } from "../types/view";
import {
    APP_FALLBACK_VIEW_ORDER,
    type AppShellViewAccess,
} from "../model/appShellModel";

export const canAccessView = (
    view: ActiveView,
    access: AppShellViewAccess,
): boolean => {
    if (view === "landing") {
        return true;
    }

    if (view === "home" || view === "chat") {
        return access.canAccessChat;
    }

    if (view === "profile") {
        return access.canAccessProfile;
    }

    if (view === "classHub") {
        return access.canAccessClassHub;
    }

    if (view === "submitAssignment" || view === "viewFeedback") {
        return access.canAccessStudentAssignments;
    }

    if (view === "publishAssignment" || view === "gradeAssignment") {
        return access.canAccessTeacherAssignments;
    }

    return false;
};

export const resolveFallbackView = (access: AppShellViewAccess): ActiveView =>
    APP_FALLBACK_VIEW_ORDER.find((view) => canAccessView(view, access)) ??
    "landing";
