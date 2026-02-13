export const classKeys = {
    all: ["class"] as const,
    context: () => [...classKeys.all, "context"] as const,
    members: (classId: string) => [...classKeys.all, "members", classId] as const,
    inviteCodes: (classId: string) =>
        [...classKeys.all, "invite-codes", classId] as const,
    threads: (classId: string) => [...classKeys.all, "threads", classId] as const,
    threadMessages: (threadId: string) =>
        [...classKeys.all, "thread-messages", threadId] as const,
};
