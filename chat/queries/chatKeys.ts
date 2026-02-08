export const chatKeys = {
    all: ["chats"] as const,
    lists: () => [...chatKeys.all, "list"] as const,
    detail: (id: string) => [...chatKeys.all, "detail", id] as const,
};
