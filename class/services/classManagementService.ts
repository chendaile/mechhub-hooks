import type {
    AssignTeacherPayload,
    ClassMembersSnapshot,
    ClassSummary,
    CreateClassPayload,
    CreateInviteCodePayload,
    InviteCodeSummary,
    JoinClassByCodePayload,
    MyClassContext,
    RemoveStudentPayload,
} from "../types";
import {
    normalizeClassMember,
    normalizeClassSummary,
    normalizeInviteCodeSummary,
} from "./classNormalizers";
import { invokeClassManagement } from "./classTransport";

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
            ? result.teachingClasses
                  .map(normalizeClassSummary)
                  .filter((row) => row.id)
            : [],
        joinedClasses: Array.isArray(result.joinedClasses)
            ? result.joinedClasses
                  .map(normalizeClassSummary)
                  .filter((row) => row.id)
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
        inviteCode:
            typeof result.inviteCode === "string" ? result.inviteCode : "",
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
        ? result.inviteCodes
              .map(normalizeInviteCodeSummary)
              .filter((code) => code.id)
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
    const result = await invokeClassManagement<{
        class?: unknown;
        alreadyJoined?: boolean;
    }>({
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
            ? result.teachers
                  .map(normalizeClassMember)
                  .filter((member) => member.userId)
            : [],
        students: Array.isArray(result.students)
            ? result.students
                  .map(normalizeClassMember)
                  .filter((member) => member.userId)
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
