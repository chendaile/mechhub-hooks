import type { UserProfile } from "../../auth/types";
import type { ClassSummary, ClassThread } from "../../class/types";
import type { ShareIntent } from "../types/share";
import type { ActiveView } from "../types/view";

export const APP_FALLBACK_VIEW_ORDER: ActiveView[] = [
    "home",
    "profile",
    "classHub",
    "submitAssignment",
    "viewFeedback",
    "publishAssignment",
    "gradeAssignment",
];

export const APP_FALLBACK_USER_PROFILE: UserProfile = {
    name: "张同学",
    avatar: "",
    role: "工程力学专业学生",
};

export const APP_CLASS_MEMBERSHIP_NOTICES = {
    submitAssignment: {
        title: "Join a class to submit assignments",
        description:
            "You currently have student assignment access, but you are not in any class yet.",
        actionLabel: "Open Class Hub",
    },
    viewFeedback: {
        title: "Join a class to view feedback",
        description:
            "Feedback is available after you join a class. Use an invite code in Class Hub.",
        actionLabel: "Open Class Hub",
    },
    publishAssignment: {
        title: "Create a class before publishing assignments",
        description:
            "You currently have teacher assignment access, but you are not assigned to any class yet.",
        actionLabel: "Open Class Hub",
    },
    gradeAssignment: {
        title: "Create a class before grading submissions",
        description:
            "No class context is available yet. Create a class or ask admin to assign you.",
        actionLabel: "Open Class Hub",
    },
} as const;

export interface AppShellViewAccess {
    canAccessChat: boolean;
    canAccessProfile: boolean;
    canAccessClassHub: boolean;
    canAccessStudentAssignments: boolean;
    canAccessTeacherAssignments: boolean;
}

export interface AppShellClassThread {
    id: string;
    classId: string;
    title: string;
    threadType: "group" | "shared_chat";
}

export interface AppShellClassGroup {
    classId: string;
    className: string;
    role: ClassSummary["role"];
    threads: AppShellClassThread[];
}

export type AppShellClassOption = ClassSummary;

export type ActiveChatTarget =
    | { type: "private" }
    | {
          type: "class";
          classId: string;
          className: string;
          threadId: string;
          threadTitle: string;
          currentUserId: string;
      };

export interface AppShellEnterClassChatPayload {
    classId: string;
    threadId: string;
    threadTitle: string;
    className?: string;
}

export const isSidebarThread = (thread: {
    threadType: ClassThread["threadType"];
}): thread is { threadType: "group" | "shared_chat" } & typeof thread =>
    thread.threadType === "group" || thread.threadType === "shared_chat";

export const createClassOptions = (
    teachingClasses: ClassSummary[],
    joinedClasses: ClassSummary[],
): ClassSummary[] => {
    const classMap = new Map<string, ClassSummary>();

    teachingClasses.forEach((classItem) =>
        classMap.set(classItem.id, classItem),
    );
    joinedClasses.forEach((classItem) => {
        if (!classMap.has(classItem.id)) {
            classMap.set(classItem.id, classItem);
        }
    });

    return Array.from(classMap.values());
};

export const buildSharePickerDescription = (
    shareIntent: ShareIntent | null,
) => {
    if (!shareIntent) {
        return "Select a class thread to share.";
    }

    if (shareIntent.kind === "chatMessage") {
        return "Select a group thread to share this message.";
    }

    return "Select a group thread to share this private session.";
};
