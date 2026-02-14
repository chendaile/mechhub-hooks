import type {
    AssignmentGradeBreakdown,
    AssignmentKeyInsight,
    AssignmentStudentSubmission,
} from "../../assignment/types";
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

export const APP_ASSIGNMENT_FIXTURES = {
    assignmentTitle: "Statics: Equilibrium of Rigid Bodies",
    assignmentDescription:
        "Upload your solution for 'Statics: Equilibrium of Rigid Bodies'. AI will analyze your steps and provide instant feedback.",
    viewFeedback: {
        overallScore: 85,
        maxScore: 100,
        submittedDate: "Oct 12, 2023",
        teacherName: "Prof. Sarah Chen",
        teacherSummary:
            "Strong conceptual understanding. Minor sign error in the uniform load moment calculation.",
        aiAnalysis:
            "The Free Body Diagram is well-drawn and correctly identifies all external forces and moments. The moment equation for the uniform load shows good understanding but had a sign convention error.",
        generalComments: "Great work overall! See annotated notes.",
        privateNotes: "Needs review on moments topic.",
    },
    modules: [
        "Statics of Rigid Bodies",
        "Dynamics I",
        "Mechanics of Materials",
    ],
    gradeStudents: [
        {
            id: "1",
            studentName: "Oliver Thompson",
            submittedDate: "Submitted 2h ago",
            status: "pending",
            submission:
                "https://via.placeholder.com/800x600?text=Student+Submission",
        },
        {
            id: "2",
            studentName: "Jane Doe",
            submittedDate: "Graded",
            status: "graded",
            submission:
                "https://via.placeholder.com/800x600?text=Student+Submission",
        },
        {
            id: "3",
            studentName: "Li Wei",
            submittedDate: "Not submitted",
            status: "pending",
            submission:
                "https://via.placeholder.com/800x600?text=Student+Submission",
        },
    ] satisfies AssignmentStudentSubmission[],
    gradeBreakdown: [
        {
            category: "Method",
            score: 30,
            maxScore: 30,
            color: "green",
        },
        {
            category: "Accuracy",
            score: 35,
            maxScore: 50,
            color: "yellow",
        },
        {
            category: "Formatting",
            score: 20,
            maxScore: 20,
            color: "green",
        },
    ] satisfies AssignmentGradeBreakdown[],
    keyInsights: [
        {
            title: "Good FBD Isolation",
            description:
                "You correctly identified all external forces acting on the beam.",
            type: "success",
        },
        {
            title: "Moment Equation (Step 2)",
            description:
                "Sign convention error in the uniform load's moment calculation. The load should be negative per your convention.",
            type: "error",
        },
    ] satisfies AssignmentKeyInsight[],
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
        return "Select a class to share.";
    }

    if (shareIntent.kind === "chatMessage") {
        return "Select a class to share this message.";
    }

    if (shareIntent.kind === "chatSession") {
        return "Select a class to share this private session.";
    }

    return "Select a class to share this grade feedback.";
};
