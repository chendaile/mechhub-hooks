import type {
    ClassMemberSummary,
    ClassSummary,
    ClassThread,
    ClassThreadMessage,
    InviteCodeSummary,
} from "../types";

type RawRecord = Record<string, unknown>;

const getString = (row: RawRecord, camel: string, snake?: string) => {
    const value = row[camel] ?? (snake ? row[snake] : undefined);
    return typeof value === "string" ? value : "";
};

const getNullableString = (row: RawRecord, camel: string, snake?: string) => {
    const value = row[camel] ?? (snake ? row[snake] : undefined);
    return typeof value === "string" ? value : null;
};

const getOptionalString = (row: RawRecord, camel: string, snake?: string) => {
    const value = row[camel] ?? (snake ? row[snake] : undefined);
    return typeof value === "string" ? value : undefined;
};

const getNumber = (row: RawRecord, camel: string, snake?: string) => {
    const value = row[camel] ?? (snake ? row[snake] : undefined);
    return typeof value === "number" ? value : 0;
};

const getBoolean = (row: RawRecord, camel: string, snake?: string) => {
    const value = row[camel] ?? (snake ? row[snake] : undefined);
    return typeof value === "boolean" ? value : Boolean(value);
};

export const normalizeClassSummary = (value: unknown): ClassSummary => {
    const row = (value ?? {}) as RawRecord;

    return {
        id: getString(row, "id"),
        name: getString(row, "name") || "Untitled Class",
        description:
            typeof row.description === "string" || row.description === null
                ? (row.description as string | null)
                : null,
        role: row.role === "teacher" ? "teacher" : "student",
        teacherCount:
            getNumber(row, "teacherCount", "teacher_count") ||
            getNumber(row, "teacher_count"),
        studentCount:
            getNumber(row, "studentCount", "student_count") ||
            getNumber(row, "student_count"),
        createdAt: getOptionalString(row, "createdAt", "created_at"),
        updatedAt: getOptionalString(row, "updatedAt", "updated_at"),
    };
};

export const normalizeInviteCodeSummary = (
    value: unknown,
): InviteCodeSummary => {
    const row = (value ?? {}) as RawRecord;

    return {
        id: getString(row, "id"),
        codeLast4: getString(row, "codeLast4", "code_last4"),
        expiresAt: getString(row, "expiresAt", "expires_at"),
        maxUses:
            typeof row.maxUses === "number"
                ? row.maxUses
                : typeof row.max_uses === "number"
                  ? row.max_uses
                  : null,
        usedCount: getNumber(row, "usedCount", "used_count"),
        isRevoked: getBoolean(row, "isRevoked", "is_revoked"),
        createdAt: getOptionalString(row, "createdAt", "created_at"),
    };
};

export const normalizeClassMember = (value: unknown): ClassMemberSummary => {
    const row = (value ?? {}) as RawRecord;

    return {
        userId: getString(row, "userId", "user_id"),
        email: getString(row, "email"),
        name:
            (typeof row.name === "string" && row.name) ||
            getString(row, "email") ||
            "Unknown User",
        avatar:
            getNullableString(row, "avatar") ??
            getNullableString(row, "avatar_url"),
        role: row.role === "teacher" ? "teacher" : "student",
        status:
            row.status === "active" || row.status === "removed"
                ? row.status
                : undefined,
        joinedAt: getOptionalString(row, "joinedAt", "joined_at"),
        removedAt: getNullableString(row, "removedAt", "removed_at"),
    };
};

export const normalizeClassThread = (value: unknown): ClassThread => {
    const row = (value ?? {}) as RawRecord;
    const rawThreadType = row.threadType ?? row.thread_type;
    const threadType =
        rawThreadType === "shared_chat" ||
        rawThreadType === "shared_grade" ||
        rawThreadType === "group"
            ? rawThreadType
            : "group";

    return {
        id: getString(row, "id"),
        classId: getString(row, "classId", "class_id"),
        threadType,
        title: (typeof row.title === "string" && row.title) || "Class Thread",
        createdByUserId: getNullableString(
            row,
            "createdByUserId",
            "created_by_user_id",
        ),
        sourceChatId: getNullableString(row, "sourceChatId", "source_chat_id"),
        sourceGradeRef: getNullableString(
            row,
            "sourceGradeRef",
            "source_grade_ref",
        ),
        createdAt: getString(row, "createdAt", "created_at"),
        updatedAt: getString(row, "updatedAt", "updated_at"),
    };
};

export const normalizeClassThreadMessage = (
    value: unknown,
): ClassThreadMessage => {
    const row = (value ?? {}) as RawRecord;
    const rawContent = row.content;
    const content =
        rawContent &&
        typeof rawContent === "object" &&
        !Array.isArray(rawContent)
            ? (rawContent as Record<string, unknown>)
            : { text: typeof rawContent === "string" ? rawContent : "" };

    return {
        id: getString(row, "id"),
        threadId: getString(row, "threadId", "thread_id"),
        senderUserId: getNullableString(row, "senderUserId", "sender_user_id"),
        senderName: getNullableString(row, "senderName", "sender_name"),
        senderEmail: getNullableString(row, "senderEmail", "sender_email"),
        senderAvatar: getNullableString(row, "senderAvatar", "sender_avatar"),
        role:
            row.role === "assistant" || row.role === "system"
                ? row.role
                : "user",
        content,
        mentionsAi: getBoolean(row, "mentionsAi", "mentions_ai"),
        replyToMessageId: getNullableString(
            row,
            "replyToMessageId",
            "reply_to_message_id",
        ),
        createdAt: getString(row, "createdAt", "created_at"),
    };
};
