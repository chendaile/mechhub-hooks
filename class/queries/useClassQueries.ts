import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "../../auth/queries/useSession";
import { classKeys } from "./classKeys";
import {
    assignTeacherToClass,
    createClass,
    createGroupThread,
    createInviteCode,
    getClassThreadMessages,
    getMyClassContext,
    isClassForbiddenError,
    joinClassByInviteCode,
    listClassMembers,
    listClassThreads,
    listInviteCodes,
    postClassMessage,
    removeStudentFromClass,
    revokeInviteCode,
    shareGradeResultToClass,
    sharePrivateChatToClass,
} from "../implementation/supabaseClassService";
import type {
    AssignTeacherPayload,
    CreateClassPayload,
    CreateInviteCodePayload,
    JoinClassByCodePayload,
    PostClassMessagePayload,
    RemoveStudentPayload,
    ShareGradeResultPayload,
    SharePrivateChatPayload,
} from "../types";

export const useMyClassContext = () => {
    const { data: session } = useSession();

    return useQuery({
        queryKey: classKeys.context(),
        queryFn: getMyClassContext,
        enabled: !!session,
        staleTime: 60_000,
    });
};

export const useClassMembers = (classId?: string, enabled = true) =>
    useQuery({
        queryKey: classKeys.members(classId ?? "unknown"),
        queryFn: () => listClassMembers(classId ?? ""),
        enabled: enabled && !!classId,
        staleTime: 30_000,
    });

export const useInviteCodes = (classId?: string, enabled = true) =>
    useQuery({
        queryKey: classKeys.inviteCodes(classId ?? "unknown"),
        queryFn: () => listInviteCodes(classId ?? ""),
        enabled: enabled && !!classId,
        staleTime: 15_000,
    });

export const useClassThreads = (classId?: string, enabled = true) =>
    useQuery({
        queryKey: classKeys.threads(classId ?? "unknown"),
        queryFn: () => listClassThreads(classId ?? ""),
        enabled: enabled && !!classId,
        staleTime: 5_000,
    });

export const useClassThreadMessages = (threadId?: string, enabled = true) =>
    useQuery({
        queryKey: classKeys.threadMessages(threadId ?? "unknown"),
        queryFn: () => getClassThreadMessages(threadId ?? ""),
        enabled: enabled && !!threadId,
        staleTime: 2_000,
    });

export const useCreateClass = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateClassPayload) => createClass(payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: classKeys.context() });
        },
    });
};

export const useAssignTeacherToClass = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: AssignTeacherPayload) =>
            assignTeacherToClass(payload),
        onSuccess: async (_, payload) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: classKeys.context() }),
                queryClient.invalidateQueries({
                    queryKey: classKeys.members(payload.classId),
                }),
            ]);
        },
    });
};

export const useCreateInviteCode = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateInviteCodePayload) => createInviteCode(payload),
        onSuccess: async (_, payload) => {
            await queryClient.invalidateQueries({
                queryKey: classKeys.inviteCodes(payload.classId),
            });
        },
    });
};

export const useRevokeInviteCode = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ classId, inviteCodeId }: { classId: string; inviteCodeId: string }) =>
            revokeInviteCode(classId, inviteCodeId),
        onSuccess: async (_, payload) => {
            await queryClient.invalidateQueries({
                queryKey: classKeys.inviteCodes(payload.classId),
            });
        },
    });
};

export const useJoinClassByInviteCode = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: JoinClassByCodePayload) =>
            joinClassByInviteCode(payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: classKeys.context() });
        },
    });
};

export const useRemoveStudentFromClass = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: RemoveStudentPayload) => removeStudentFromClass(payload),
        onSuccess: async (_, payload) => {
            await queryClient.invalidateQueries({
                queryKey: classKeys.members(payload.classId),
            });
            await queryClient.invalidateQueries({ queryKey: classKeys.context() });
        },
    });
};

export const useCreateGroupThread = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ classId, title }: { classId: string; title: string }) =>
            createGroupThread(classId, title),
        onSuccess: async (_, payload) => {
            await queryClient.invalidateQueries({
                queryKey: classKeys.threads(payload.classId),
            });
        },
    });
};

export const usePostClassMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: PostClassMessagePayload) => postClassMessage(payload),
        onSuccess: async (_, payload) => {
            await queryClient.invalidateQueries({
                queryKey: classKeys.threadMessages(payload.threadId),
            });
            const threadId = payload.threadId;
            queryClient.invalidateQueries({ queryKey: classKeys.all });
            await queryClient.invalidateQueries({
                predicate: ({ queryKey }) =>
                    Array.isArray(queryKey) &&
                    queryKey.length >= 3 &&
                    queryKey[0] === "class" &&
                    queryKey[1] === "thread-messages" &&
                    queryKey[2] === threadId,
            });
        },
    });
};

export const useSharePrivateChatToClass = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: SharePrivateChatPayload) =>
            sharePrivateChatToClass(payload),
        onSuccess: async (thread) => {
            await queryClient.invalidateQueries({
                queryKey: classKeys.threads(thread.classId),
            });
        },
    });
};

export const useShareGradeResultToClass = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: ShareGradeResultPayload) =>
            shareGradeResultToClass(payload),
        onSuccess: async (thread) => {
            await queryClient.invalidateQueries({
                queryKey: classKeys.threads(thread.classId),
            });
        },
    });
};

export { isClassForbiddenError };
