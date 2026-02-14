import { useMutation, useQueryClient } from "@tanstack/react-query";
import { classDomainInterface } from "../interface/ClassDomainInterface";
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
import { classKeys } from "./classKeys";

export const useCreateClassMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateClassPayload) =>
            classDomainInterface.createClass(payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: classKeys.context(),
            });
        },
    });
};

export const useAssignTeacherToClassMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: AssignTeacherPayload) =>
            classDomainInterface.assignTeacherToClass(payload),
        onSuccess: async (_, payload) => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: classKeys.context(),
                }),
                queryClient.invalidateQueries({
                    queryKey: classKeys.members(payload.classId),
                }),
            ]);
        },
    });
};

export const useCreateInviteCodeMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateInviteCodePayload) =>
            classDomainInterface.createInviteCode(payload),
        onSuccess: async (_, payload) => {
            await queryClient.invalidateQueries({
                queryKey: classKeys.inviteCodes(payload.classId),
            });
        },
    });
};

export const useRevokeInviteCodeMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            classId,
            inviteCodeId,
        }: {
            classId: string;
            inviteCodeId: string;
        }) => classDomainInterface.revokeInviteCode(classId, inviteCodeId),
        onSuccess: async (_, payload) => {
            await queryClient.invalidateQueries({
                queryKey: classKeys.inviteCodes(payload.classId),
            });
        },
    });
};

export const useJoinClassByInviteCodeMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: JoinClassByCodePayload) =>
            classDomainInterface.joinClassByInviteCode(payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: classKeys.context(),
            });
        },
    });
};

export const useRemoveStudentFromClassMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: RemoveStudentPayload) =>
            classDomainInterface.removeStudentFromClass(payload),
        onSuccess: async (_, payload) => {
            await queryClient.invalidateQueries({
                queryKey: classKeys.members(payload.classId),
            });
            await queryClient.invalidateQueries({
                queryKey: classKeys.context(),
            });
        },
    });
};

export const useCreateGroupThreadMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ classId, title }: { classId: string; title: string }) =>
            classDomainInterface.createGroupThread(classId, title),
        onSuccess: async (_, payload) => {
            await queryClient.invalidateQueries({
                queryKey: classKeys.threads(payload.classId),
            });
        },
    });
};

export const usePostClassMessageMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: PostClassMessagePayload) =>
            classDomainInterface.postClassMessage(payload),
        onSuccess: async (_, payload) => {
            await queryClient.invalidateQueries({
                queryKey: classKeys.threadMessages(payload.threadId),
            });
            await queryClient.invalidateQueries({ queryKey: classKeys.all });
        },
    });
};

export const useSharePrivateChatToClassMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: SharePrivateChatPayload) =>
            classDomainInterface.sharePrivateChatToClass(payload),
        onSuccess: async (thread) => {
            await queryClient.invalidateQueries({
                queryKey: classKeys.threads(thread.classId),
            });
        },
    });
};

export const useShareGradeResultToClassMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: ShareGradeResultPayload) =>
            classDomainInterface.shareGradeResultToClass(payload),
        onSuccess: async (thread) => {
            await queryClient.invalidateQueries({
                queryKey: classKeys.threads(thread.classId),
            });
        },
    });
};
