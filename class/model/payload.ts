export interface CreateClassPayload {
    name: string;
    description?: string;
    teacherUserId?: string;
}

export interface CreateInviteCodePayload {
    classId: string;
    expiresInHours?: number;
    maxUses?: number | null;
}

export interface JoinClassByCodePayload {
    inviteCode: string;
}

export interface AssignTeacherPayload {
    classId: string;
    teacherUserId: string;
}

export interface RemoveStudentPayload {
    classId: string;
    studentUserId: string;
}

export interface PostClassMessagePayload {
    threadId: string;
    content: Record<string, unknown> | string;
}

export interface SharePrivateChatPayload {
    classId: string;
    chatId: string;
    messageIds?: string[];
}

export interface ShareGradeResultPayload {
    classId: string;
    gradePayload: Record<string, unknown>;
}
