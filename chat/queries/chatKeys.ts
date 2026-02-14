const resolveViewerUserId = (viewerUserId?: string | null) =>
    viewerUserId?.trim() || "__anonymous__";

export const chatKeys = {
    all: (viewerUserId?: string | null) =>
        ["chats", resolveViewerUserId(viewerUserId)] as const,
    lists: (viewerUserId?: string | null) =>
        [...chatKeys.all(viewerUserId), "list"] as const,
    detail: (viewerUserId: string | null | undefined, id: string) =>
        [...chatKeys.all(viewerUserId), "detail", id] as const,
};
