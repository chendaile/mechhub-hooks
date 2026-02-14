import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSessionQuery } from "../../auth/queries/useSession";
import { authzKeys } from "./authzKeys";
import { authzDomainInterface } from "../interface/AuthzDomainInterface";
import { type PermissionKey, type UpsertUserAccessPayload } from "../types";
import { hasPermission } from "../utils/permissionPredicates";

export const useMyAuthorizationQuery = () => {
    const { data: session } = useSessionQuery();
    const viewerUserId = session?.user.id ?? null;

    return useQuery({
        queryKey: authzKeys.my(viewerUserId),
        queryFn: authzDomainInterface.getMyAuthorization,
        enabled: !!session,
        staleTime: 60_000,
    });
};

export const usePermissionGate = (permission: PermissionKey) => {
    const query = useMyAuthorizationQuery();
    return {
        ...query,
        allowed: hasPermission(query.data, permission),
    };
};

export const useAdminUserSearchMutation = () =>
    useMutation({
        mutationFn: (email: string) =>
            authzDomainInterface.searchUserByEmail(email),
    });

export const useAdminUserAccessQuery = (
    targetUserId?: string,
    enabled = true,
) => {
    const { data: session } = useSessionQuery();
    const viewerUserId = session?.user.id ?? null;

    return useQuery({
        queryKey: authzKeys.adminUserAccess(
            viewerUserId,
            targetUserId ?? "unknown",
        ),
        queryFn: () =>
            authzDomainInterface.getAdminUserAccess(targetUserId ?? ""),
        enabled: enabled && !!targetUserId && !!session,
        retry: false,
        staleTime: 30_000,
    });
};

export const useUpsertUserAccessMutation = () => {
    const queryClient = useQueryClient();
    const { data: session } = useSessionQuery();
    const viewerUserId = session?.user.id ?? null;

    return useMutation({
        mutationFn: (payload: UpsertUserAccessPayload) =>
            authzDomainInterface.upsertAdminUserAccess(payload),
        onSuccess: (snapshot) => {
            queryClient.setQueryData(
                authzKeys.adminUserAccess(viewerUserId, snapshot.userId),
                snapshot,
            );
            queryClient.invalidateQueries({
                queryKey: authzKeys.my(viewerUserId),
            });
        },
    });
};

export const isForbiddenError = authzDomainInterface.isForbiddenError;
export { hasPermission };
