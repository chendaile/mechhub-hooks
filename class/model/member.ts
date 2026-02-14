import type { ClassRole } from "./class";

export interface ClassMemberSummary {
    userId: string;
    email: string;
    name: string;
    avatar?: string | null;
    role: ClassRole;
    status?: "active" | "removed";
    joinedAt?: string;
    removedAt?: string | null;
}

export interface ClassMembersSnapshot {
    classId: string;
    teachers: ClassMemberSummary[];
    students: ClassMemberSummary[];
}
