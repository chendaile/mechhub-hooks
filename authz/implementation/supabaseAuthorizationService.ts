import { supabase } from "../../shared/supabase";
import {
    PERMISSION_KEYS,
    type AdminUserSummary,
    type AuthorizationSnapshot,
    type BaseRole,
    type OverrideEffect,
    type PermissionEffect,
    type PermissionKey,
    type UpsertUserAccessPayload,
} from "../types";

const PERMISSION_KEY_SET = new Set<PermissionKey>(PERMISSION_KEYS);

export class AuthorizationServiceError extends Error {
    status?: number;

    constructor(message: string, status?: number) {
        super(message);
        this.name = "AuthorizationServiceError";
        this.status = status;
    }
}

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
        (acc, permissionKey) => {
            const effect = record[permissionKey];
            if (effect === "allow" || effect === "deny") {
                acc[permissionKey] = effect;
            }
            return acc;
        },
        {} as Partial<Record<PermissionKey, OverrideEffect>>,
    );
};

const normalizeAuthorizationSnapshot = (value: unknown): AuthorizationSnapshot => {
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

const extractStatus = (error: unknown): number | undefined => {
    if (!error || typeof error !== "object") {
        return undefined;
    }

    const errorObject = error as {
        status?: number;
        context?: { status?: number; response?: { status?: number } };
    };

    if (typeof errorObject.status === "number") {
        return errorObject.status;
    }

    if (typeof errorObject.context?.status === "number") {
        return errorObject.context.status;
    }

    if (typeof errorObject.context?.response?.status === "number") {
        return errorObject.context.response.status;
    }

    return undefined;
};

const toServiceError = (error: unknown): AuthorizationServiceError => {
    if (error instanceof AuthorizationServiceError) {
        return error;
    }

    if (error instanceof Error) {
        return new AuthorizationServiceError(error.message, extractStatus(error));
    }

    return new AuthorizationServiceError(String(error));
};

export const isForbiddenError = (error: unknown) => {
    const status = extractStatus(error);
    if (status === 403) {
        return true;
    }

    const message =
        error instanceof Error ? error.message.toLowerCase() : String(error);
    return message.includes("forbidden");
};

const invokePermissionsAdmin = async <T>(body: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke("permissions-admin", {
        body,
    });

    if (error) {
        throw toServiceError(error);
    }

    return data as T;
};

export const getMyAuthorization = async (): Promise<AuthorizationSnapshot> => {
    const { data, error } = await supabase.rpc("get_my_authorization");

    if (error) {
        throw toServiceError(error);
    }

    return normalizeAuthorizationSnapshot(data);
};

export const searchUserByEmail = async (
    email: string,
): Promise<AdminUserSummary[]> => {
    const result = await invokePermissionsAdmin<{ users?: unknown[] }>({
        action: "search_user_by_email",
        email,
    });

    const users = Array.isArray(result.users) ? result.users : [];

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

export const getAdminUserAccess = async (
    targetUserId: string,
): Promise<AuthorizationSnapshot> => {
    const result = await invokePermissionsAdmin<{ access?: unknown }>({
        action: "get_user_access",
        target_user_id: targetUserId,
    });

    return normalizeAuthorizationSnapshot(result.access);
};

const normalizePayloadOverrides = (
    overrides: Record<PermissionKey, PermissionEffect>,
) =>
    PERMISSION_KEYS.reduce(
        (acc, permissionKey) => {
            acc[permissionKey] = overrides[permissionKey] ?? "inherit";
            return acc;
        },
        {} as Record<PermissionKey, PermissionEffect>,
    );

export const upsertAdminUserAccess = async (
    payload: UpsertUserAccessPayload,
): Promise<AuthorizationSnapshot> => {
    const result = await invokePermissionsAdmin<{ access?: unknown }>({
        action: "upsert_user_access",
        target_user_id: payload.targetUserId,
        base_role: payload.baseRole,
        overrides: normalizePayloadOverrides(payload.overrides),
    });

    return normalizeAuthorizationSnapshot(result.access);
};
