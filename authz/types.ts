export const PERMISSION_KEYS = [
    "chat.access",
    "profile.access",
    "assignment.student.access",
    "assignment.teacher.access",
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];
export type BaseRole = "student" | "teacher";
export type PermissionEffect = "inherit" | "allow" | "deny";
export type OverrideEffect = Exclude<PermissionEffect, "inherit">;

export interface AuthorizationSnapshot {
    userId: string;
    baseRole: BaseRole;
    effectivePermissions: PermissionKey[];
    overrides: Partial<Record<PermissionKey, OverrideEffect>>;
}

export interface AdminUserSummary {
    id: string;
    email: string;
    name: string;
}

export interface UpsertUserAccessPayload {
    targetUserId: string;
    baseRole: BaseRole;
    overrides: Record<PermissionKey, PermissionEffect>;
}
