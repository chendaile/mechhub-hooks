const resolveViewerUserId = (viewerUserId?: string | null) =>
    viewerUserId?.trim() || "__anonymous__";

export const classKeys = {
    all: (viewerUserId?: string | null) =>
        ["class", resolveViewerUserId(viewerUserId)] as const,
    context: (viewerUserId?: string | null) =>
        [...classKeys.all(viewerUserId), "context"] as const,
    members: (viewerUserId: string | null | undefined, classId: string) =>
        [...classKeys.all(viewerUserId), "members", classId] as const,
    inviteCodes: (viewerUserId: string | null | undefined, classId: string) =>
        [...classKeys.all(viewerUserId), "invite-codes", classId] as const,
    threads: (viewerUserId: string | null | undefined, classId: string) =>
        [...classKeys.all(viewerUserId), "threads", classId] as const,
    threadMessages: (
        viewerUserId: string | null | undefined,
        threadId: string,
    ) => [...classKeys.all(viewerUserId), "thread-messages", threadId] as const,
};
