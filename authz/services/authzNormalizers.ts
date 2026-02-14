import {
    PERMISSION_KEYS,
    type AdminUserSummary,
    type AuthorizationSnapshot,
    type BaseRole,
    type OverrideEffect,
    type PermissionKey,
} from "../types";

const PERMISSION_KEY_SET = new Set<PermissionKey>(PERMISSION_KEYS);

const normalizeBaseRole = (value: unknown): BaseRole =>
    value === "teacher" ? "teacher" : "student";

const normalizeEffectivePermissions = (value: unknown): PermissionKey[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.filter(
        (permission): permission is PermissionKey =>
            typeof permission === "string" &&
            PERMISSION_KEY_SET.has(permission as PermissionKey),
    );
};

const normalizeOverrides = (
    value: unknown,
): Partial<Record<PermissionKey, OverrideEffect>> => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return {};
    }

    const record = value as Record<string, unknown>;
    return PERMISSION_KEYS.reduce(
        (accumulator, permissionKey) => {
            const effect = record[permissionKey];
            if (effect === "allow" || effect === "deny") {
                accumulator[permissionKey] = effect;
            }
            return accumulator;
        },
        {} as Partial<Record<PermissionKey, OverrideEffect>>,
    );
};

export const normalizeAuthorizationSnapshot = (
    value: unknown,
): AuthorizationSnapshot => {
    const raw = (value ?? {}) as Record<string, unknown>;

    return {
        userId:
            typeof raw.userId === "string"
                ? raw.userId
                : typeof raw.user_id === "string"
                  ? raw.user_id
                  : "",
        baseRole: normalizeBaseRole(raw.baseRole ?? raw.base_role),
        effectivePermissions: normalizeEffectivePermissions(
            raw.effectivePermissions ?? raw.effective_permissions,
        ),
        overrides: normalizeOverrides(raw.overrides),
    };
};

export const normalizeAdminUserSummaries = (
    value: unknown,
): AdminUserSummary[] => {
    const users = Array.isArray(value) ? value : [];

    return users
        .map((row) => {
            const item = (row ?? {}) as Record<string, unknown>;
            return {
                id: typeof item.id === "string" ? item.id : "",
                email: typeof item.email === "string" ? item.email : "",
                name:
                    typeof item.name === "string"
                        ? item.name
                        : typeof item.email === "string"
                          ? item.email
                          : "",
            };
        })
        .filter((user) => user.id && user.email);
};
