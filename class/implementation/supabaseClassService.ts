import { supabase } from "../../shared/supabase";
import type {
    AssignTeacherPayload,
    ClassMemberSummary,
    ClassMembersSnapshot,
    ClassSummary,
    ClassThread,
    ClassThreadMessage,
    CreateClassPayload,
    CreateInviteCodePayload,
    InviteCodeSummary,
    JoinClassByCodePayload,
    MyClassContext,
    PostClassMessagePayload,
    PostClassMessageResult,
    RemoveStudentPayload,
    ShareGradeResultPayload,
    SharePrivateChatPayload,
} from "../types";

export class ClassServiceError extends Error {
    status?: number;

    constructor(message: string, status?: number) {
        super(message);
        this.name = "ClassServiceError";
        this.status = status;
    }
}

const extractStatus = (error: unknown): number | undefined => {
    if (!error || typeof error !== "object") {
        return undefined;
    }

    const obj = error as {
        status?: number;
        context?: { status?: number; response?: { status?: number } };
    };

    if (typeof obj.status === "number") {
        return obj.status;
    }

    if (typeof obj.context?.status === "number") {
        return obj.context.status;
    }

    if (typeof obj.context?.response?.status === "number") {
        return obj.context.response.status;
    }

    return undefined;
};

const toServiceError = (error: unknown): ClassServiceError => {
    if (error instanceof ClassServiceError) {
        return error;
    }

    if (error instanceof Error) {
        return new ClassServiceError(error.message, extractStatus(error));
    }

    return new ClassServiceError(String(error));
};

const invokeClassManagement = async <T>(body: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke("class-management", {
        body,
    });

    if (error) {
        throw toServiceError(error);
    }

    return data as T;
};

const invokeClassChat = async <T>(body: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke("class-chat", {
        body,
    });

    if (error) {
        throw toServiceError(error);
    }

    return data as T;
};

const normalizeClassSummary = (value: unknown): ClassSummary => {
    const row = (value ?? {}) as Record<string, unknown>;

    return {
        id: typeof row.id === "string" ? row.id : "",
        name: typeof row.name === "string" ? row.name : "Untitled Class",
        description:
            typeof row.description === "string" || row.description === null
                ? (row.description as string | null)
                : null,
        role: row.role === "teacher" ? "teacher" : "student",
        teacherCount:
            typeof row.teacherCount === "number"
                ? row.teacherCount
                : typeof row.teacher_count === "number"
                  ? row.teacher_count
                  : 0,
        studentCount:
            typeof row.studentCount === "number"
                ? row.studentCount
                : typeof row.student_count === "number"
                  ? row.student_count
                  : 0,
        createdAt:
            typeof row.createdAt === "string"
                ? row.createdAt
                : typeof row.created_at === "string"
                  ? row.created_at
                  : undefined,
        updatedAt:
            typeof row.updatedAt === "string"
                ? row.updatedAt
                : typeof row.updated_at === "string"
                  ? row.updated_at
                  : undefined,
    };
};

const normalizeInviteCodeSummary = (value: unknown): InviteCodeSummary => {
    const row = (value ?? {}) as Record<string, unknown>;

    return {
        id: typeof row.id === "string" ? row.id : "",
        codeLast4:
            typeof row.codeLast4 === "string"
                ? row.codeLast4
                : typeof row.code_last4 === "string"
                  ? row.code_last4
                  : "",
        expiresAt:
            typeof row.expiresAt === "string"
                ? row.expiresAt
                : typeof row.expires_at === "string"
                  ? row.expires_at
                  : "",
        maxUses:
            typeof row.maxUses === "number"
                ? row.maxUses
                : typeof row.max_uses === "number"
                  ? row.max_uses
                  : null,
        usedCount:
            typeof row.usedCount === "number"
                ? row.usedCount
                : typeof row.used_count === "number"
                  ? row.used_count
                  : 0,
        isRevoked:
            typeof row.isRevoked === "boolean"
                ? row.isRevoked
                : Boolean(row.is_revoked),
        createdAt:
            typeof row.createdAt === "string"
                ? row.createdAt
                : typeof row.created_at === "string"
                  ? row.created_at
                  : undefined,
    };
};

const normalizeClassMember = (value: unknown): ClassMemberSummary => {
    const row = (value ?? {}) as Record<string, unknown>;

    return {
        userId:
            typeof row.userId === "string"
                ? row.userId
                : typeof row.user_id === "string"
                  ? row.user_id
                  : "",
        email: typeof row.email === "string" ? row.email : "",
        name:
            typeof row.name === "string" && row.name
                ? row.name
                : typeof row.email === "string"
                  ? row.email
                  : "Unknown User",
        role: row.role === "teacher" ? "teacher" : "student",
        status:
            row.status === "active" || row.status === "removed"
                ? row.status
                : undefined,
        joinedAt:
            typeof row.joinedAt === "string"
                ? row.joinedAt
                : typeof row.joined_at === "string"
                  ? row.joined_at
                  : undefined,
        removedAt:
            typeof row.removedAt === "string"
                ? row.removedAt
                : typeof row.removed_at === "string"
                  ? row.removed_at
                  : null,
    };
};

const normalizeClassThread = (value: unknown): ClassThread => {
    const row = (value ?? {}) as Record<string, unknown>;

    return {
        id: typeof row.id === "string" ? row.id : "",
        classId:
            typeof row.classId === "string"
                ? row.classId
                : typeof row.class_id === "string"
                  ? row.class_id
                  : "",
        threadType:
            row.threadType === "shared_chat" ||
            row.threadType === "shared_grade" ||
            row.threadType === "group"
                ? row.threadType
                : row.thread_type === "shared_chat" ||
                    row.thread_type === "shared_grade"
                  ? row.thread_type
                  : "group",
        title:
            typeof row.title === "string" && row.title
                ? row.title
                : "Class Thread",
        createdByUserId:
            typeof row.createdByUserId === "string"
                ? row.createdByUserId
                : typeof row.created_by_user_id === "string"
                  ? row.created_by_user_id
                  : null,
        sourceChatId:
            typeof row.sourceChatId === "string"
                ? row.sourceChatId
                : typeof row.source_chat_id === "string"
                  ? row.source_chat_id
                  : null,
        sourceGradeRef:
            typeof row.sourceGradeRef === "string"
                ? row.sourceGradeRef
                : typeof row.source_grade_ref === "string"
                  ? row.source_grade_ref
                  : null,
        createdAt:
            typeof row.createdAt === "string"
                ? row.createdAt
                : typeof row.created_at === "string"
                  ? row.created_at
                  : "",
        updatedAt:
            typeof row.updatedAt === "string"
                ? row.updatedAt
                : typeof row.updated_at === "string"
                  ? row.updated_at
                  : "",
    };
};

const normalizeClassThreadMessage = (value: unknown): ClassThreadMessage => {
    const row = (value ?? {}) as Record<string, unknown>;

    const rawContent = row.content;
    const content =
        rawContent && typeof rawContent === "object" && !Array.isArray(rawContent)
            ? (rawContent as Record<string, unknown>)
            : { text: typeof rawContent === "string" ? rawContent : "" };

    return {
        id: typeof row.id === "string" ? row.id : "",
        threadId:
            typeof row.threadId === "string"
                ? row.threadId
                : typeof row.thread_id === "string"
                  ? row.thread_id
                  : "",
        senderUserId:
            typeof row.senderUserId === "string"
                ? row.senderUserId
                : typeof row.sender_user_id === "string"
                  ? row.sender_user_id
                  : null,
        senderName:
            typeof row.senderName === "string"
                ? row.senderName
                : typeof row.sender_name === "string"
                  ? row.sender_name
                  : null,
        senderEmail:
            typeof row.senderEmail === "string"
                ? row.senderEmail
                : typeof row.sender_email === "string"
                  ? row.sender_email
                  : null,
        role:
            row.role === "assistant" || row.role === "system"
                ? row.role
                : "user",
        content,
        mentionsAi:
            typeof row.mentionsAi === "boolean"
                ? row.mentionsAi
                : Boolean(row.mentions_ai),
        replyToMessageId:
            typeof row.replyToMessageId === "string"
                ? row.replyToMessageId
                : typeof row.reply_to_message_id === "string"
                  ? row.reply_to_message_id
                  : null,
        createdAt:
            typeof row.createdAt === "string"
                ? row.createdAt
                : typeof row.created_at === "string"
                  ? row.created_at
                  : "",
    };
};

export const getMyClassContext = async (): Promise<MyClassContext> => {
    const result = await invokeClassManagement<{
        teachingClasses?: unknown[];
        joinedClasses?: unknown[];
        hasAnyMembership?: boolean;
        isAdmin?: boolean;
    }>({
        action: "list_my_classes",
    });

    return {
        teachingClasses: Array.isArray(result.teachingClasses)
            ? result.teachingClasses.map(normalizeClassSummary).filter((row) => row.id)
            : [],
        joinedClasses: Array.isArray(result.joinedClasses)
            ? result.joinedClasses.map(normalizeClassSummary).filter((row) => row.id)
            : [],
        hasAnyMembership: !!result.hasAnyMembership,
        isAdmin: !!result.isAdmin,
    };
};

export const createClass = async (
    payload: CreateClassPayload,
): Promise<ClassSummary> => {
    const result = await invokeClassManagement<{ class?: unknown }>({
        action: "create_class",
        name: payload.name,
        description: payload.description ?? "",
        teacher_user_id: payload.teacherUserId ?? "",
    });

    return normalizeClassSummary(result.class);
};

export const assignTeacherToClass = async (
    payload: AssignTeacherPayload,
): Promise<void> => {
    await invokeClassManagement({
        action: "assign_teacher_to_class",
        class_id: payload.classId,
        teacher_user_id: payload.teacherUserId,
    });
};

export const createInviteCode = async (
    payload: CreateInviteCodePayload,
): Promise<{ inviteCode: string; inviteCodeMeta: InviteCodeSummary }> => {
    const result = await invokeClassManagement<{
        inviteCode?: string;
        inviteCodeMeta?: unknown;
    }>({
        action: "create_invite_code",
        class_id: payload.classId,
        expires_in_hours: payload.expiresInHours,
        max_uses: payload.maxUses ?? null,
    });

    return {
        inviteCode: typeof result.inviteCode === "string" ? result.inviteCode : "",
        inviteCodeMeta: normalizeInviteCodeSummary(result.inviteCodeMeta),
    };
};

export const listInviteCodes = async (
    classId: string,
): Promise<InviteCodeSummary[]> => {
    const result = await invokeClassManagement<{ inviteCodes?: unknown[] }>({
        action: "list_invite_codes",
        class_id: classId,
    });

    return Array.isArray(result.inviteCodes)
        ? result.inviteCodes.map(normalizeInviteCodeSummary).filter((code) => code.id)
        : [];
};

export const revokeInviteCode = async (
    classId: string,
    inviteCodeId: string,
): Promise<void> => {
    await invokeClassManagement({
        action: "revoke_invite_code",
        class_id: classId,
        invite_code_id: inviteCodeId,
    });
};

export const joinClassByInviteCode = async (
    payload: JoinClassByCodePayload,
): Promise<{ classSummary: ClassSummary; alreadyJoined: boolean }> => {
    const result = await invokeClassManagement<{ class?: unknown; alreadyJoined?: boolean }>({
        action: "join_class_by_invite_code",
        invite_code: payload.inviteCode,
    });

    return {
        classSummary: normalizeClassSummary(result.class),
        alreadyJoined: !!result.alreadyJoined,
    };
};

export const listClassMembers = async (
    classId: string,
): Promise<ClassMembersSnapshot> => {
    const result = await invokeClassManagement<{
        classId?: string;
        class_id?: string;
        teachers?: unknown[];
        students?: unknown[];
    }>({
        action: "list_class_members",
        class_id: classId,
    });

    return {
        classId:
            typeof result.classId === "string"
                ? result.classId
                : typeof result.class_id === "string"
                  ? result.class_id
                  : classId,
        teachers: Array.isArray(result.teachers)
            ? result.teachers.map(normalizeClassMember).filter((member) => member.userId)
            : [],
        students: Array.isArray(result.students)
            ? result.students.map(normalizeClassMember).filter((member) => member.userId)
            : [],
    };
};

export const removeStudentFromClass = async (
    payload: RemoveStudentPayload,
): Promise<void> => {
    await invokeClassManagement({
        action: "remove_student_from_class",
        class_id: payload.classId,
        student_user_id: payload.studentUserId,
    });
};

export const listClassThreads = async (
    classId: string,
): Promise<ClassThread[]> => {
    const result = await invokeClassChat<{ threads?: unknown[] }>({
        action: "list_threads",
        class_id: classId,
    });

    return Array.isArray(result.threads)
        ? result.threads.map(normalizeClassThread).filter((thread) => thread.id)
        : [];
};

export const createGroupThread = async (
    classId: string,
    title: string,
): Promise<ClassThread> => {
    const result = await invokeClassChat<{ thread?: unknown }>({
        action: "create_group_thread",
        class_id: classId,
        title,
    });

    return normalizeClassThread(result.thread);
};

export const getClassThreadMessages = async (
    threadId: string,
    cursor?: string,
): Promise<ClassThreadMessage[]> => {
    const result = await invokeClassChat<{ messages?: unknown[] }>({
        action: "get_thread_messages",
        thread_id: threadId,
        cursor: cursor ?? "",
    });

    return Array.isArray(result.messages)
        ? result.messages
              .map(normalizeClassThreadMessage)
              .filter((message) => message.id)
        : [];
};

export const postClassMessage = async (
    payload: PostClassMessagePayload,
): Promise<PostClassMessageResult> => {
    const result = await invokeClassChat<{ message?: unknown; aiMessage?: unknown }>({
        action: "post_message",
        thread_id: payload.threadId,
        content: payload.content,
    });

    return {
        message: normalizeClassThreadMessage(result.message),
        aiMessage: result.aiMessage
            ? normalizeClassThreadMessage(result.aiMessage)
            : null,
    };
};

export const sharePrivateChatToClass = async (
    payload: SharePrivateChatPayload,
): Promise<ClassThread> => {
    const result = await invokeClassChat<{ thread?: unknown }>({
        action: "share_private_chat",
        class_id: payload.classId,
        chat_id: payload.chatId,
        message_ids: payload.messageIds ?? [],
    });

    return normalizeClassThread(result.thread);
};

export const shareGradeResultToClass = async (
    payload: ShareGradeResultPayload,
): Promise<ClassThread> => {
    const result = await invokeClassChat<{ thread?: unknown }>({
        action: "share_grade_result",
        class_id: payload.classId,
        grade_payload: payload.gradePayload,
    });

    return normalizeClassThread(result.thread);
};

export const isClassForbiddenError = (error: unknown) => {
    const status = extractStatus(error);
    if (status === 403) {
        return true;
    }

    const message =
        error instanceof Error ? error.message.toLowerCase() : String(error);
    return message.includes("forbidden");
};
