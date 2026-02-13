import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { useSession } from "../../auth/queries/useSession";
import { authzKeys } from "./authzKeys";
import {
    getAdminUserAccess,
    getMyAuthorization,
    isForbiddenError,
    searchUserByEmail,
    upsertAdminUserAccess,
} from "../implementation/supabaseAuthorizationService";
import {
    type AuthorizationSnapshot,
    type PermissionKey,
    type UpsertUserAccessPayload,
} from "../types";

export const hasPermission = (
    snapshot: AuthorizationSnapshot | null | undefined,
    permission: PermissionKey,
) => !!snapshot?.effectivePermissions.includes(permission);

export const useMyAuthorization = () => {
    const { data: session } = useSession();

    return useQuery({
        queryKey: authzKeys.my(),
        queryFn: getMyAuthorization,
        enabled: !!session,
        staleTime: 60_000,
    });
};

export const usePermissionGate = (permission: PermissionKey) => {
    const query = useMyAuthorization();
    return {
        ...query,
        allowed: hasPermission(query.data, permission),
    };
};

export const useAdminUserSearch = () =>
    useMutation({
        mutationFn: (email: string) => searchUserByEmail(email),
    });

export const useAdminUserAccess = (targetUserId?: string, enabled = true) =>
    useQuery({
        queryKey: authzKeys.adminUserAccess(targetUserId ?? "unknown"),
        queryFn: () => getAdminUserAccess(targetUserId ?? ""),
        enabled: enabled && !!targetUserId,
        retry: false,
        staleTime: 30_000,
    });

export const useUpsertUserAccess = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpsertUserAccessPayload) =>
            upsertAdminUserAccess(payload),
        onSuccess: (snapshot) => {
            queryClient.setQueryData(
                authzKeys.adminUserAccess(snapshot.userId),
                snapshot,
            );
            queryClient.invalidateQueries({ queryKey: authzKeys.my() });
        },
    });
};

export { isForbiddenError };
