const resolveViewerUserId = (viewerUserId?: string | null) =>
    viewerUserId?.trim() || "__anonymous__";

export const authzKeys = {
    all: (viewerUserId?: string | null) =>
        ["authz", resolveViewerUserId(viewerUserId)] as const,
    my: (viewerUserId?: string | null) =>
        [...authzKeys.all(viewerUserId), "my"] as const,
    adminUserAccess: (
        viewerUserId: string | null | undefined,
        targetUserId: string,
    ) => [...authzKeys.all(viewerUserId), "admin-user-access", targetUserId] as const,
};
