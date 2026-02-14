import { supabase } from "../../shared/supabase";
import type {
    AuthorizationSnapshot,
    PermissionEffect,
    PermissionKey,
    UpsertUserAccessPayload,
} from "../types";
import { toAuthorizationServiceError } from "./authzErrors";
import {
    normalizeAdminUserSummaries,
    normalizeAuthorizationSnapshot,
} from "./authzNormalizers";
import { invokePermissionsAdmin } from "./authzTransport";

export const getMyAuthorization = async (): Promise<AuthorizationSnapshot> => {
    const { data, error } = await supabase.rpc("get_my_authorization");

    if (error) {
        throw toAuthorizationServiceError(error);
    }

    return normalizeAuthorizationSnapshot(data);
};

export const searchUserByEmail = async (email: string) => {
    const result = await invokePermissionsAdmin<{ users?: unknown[] }>({
        action: "search_user_by_email",
        email,
    });

    return normalizeAdminUserSummaries(result.users);
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
    (Object.keys(overrides) as PermissionKey[]).reduce(
        (accumulator, permissionKey) => {
            accumulator[permissionKey] = overrides[permissionKey] ?? "inherit";
            return accumulator;
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
