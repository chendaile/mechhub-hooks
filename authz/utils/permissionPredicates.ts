import type { AuthorizationSnapshot, PermissionKey } from "../types";

export const hasPermission = (
    snapshot: AuthorizationSnapshot | null | undefined,
    permission: PermissionKey,
) => !!snapshot?.effectivePermissions.includes(permission);
