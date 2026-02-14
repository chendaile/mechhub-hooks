import type { ActiveView } from "../../app/types/view";

export interface SidebarClassThread {
    id: string;
    classId: string;
    title: string;
    threadType: "group" | "shared_chat";
}

export interface SidebarClassGroup {
    classId: string;
    className: string;
    role: "teacher" | "student";
    threads: SidebarClassThread[];
}

export type SidebarAssignmentActionViewKey = Extract<
    ActiveView,
    | "submitAssignment"
    | "viewFeedback"
    | "publishAssignment"
    | "gradeAssignment"
>;

export type SidebarActionAudience = "student" | "teacher";

export interface SidebarAssignmentAction {
    key: SidebarAssignmentActionViewKey;
    label: string;
    audience: SidebarActionAudience;
    onClick: () => void;
}
