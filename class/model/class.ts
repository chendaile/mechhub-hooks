export type ClassRole = "teacher" | "student";

export interface ClassSummary {
    id: string;
    name: string;
    description?: string | null;
    role: ClassRole;
    teacherCount: number;
    studentCount: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface MyClassContext {
    teachingClasses: ClassSummary[];
    joinedClasses: ClassSummary[];
    hasAnyMembership: boolean;
    isAdmin: boolean;
}

export interface InviteCodeSummary {
    id: string;
    codeLast4: string;
    expiresAt: string;
    maxUses: number | null;
    usedCount: number;
    isRevoked: boolean;
    createdAt?: string;
}
