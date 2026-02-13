export const authzKeys = {
    all: ["authz"] as const,
    my: () => [...authzKeys.all, "my"] as const,
    adminUserAccess: (userId: string) =>
        [...authzKeys.all, "admin-user-access", userId] as const,
};
