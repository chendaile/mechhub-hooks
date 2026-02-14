import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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

const getErrorMessage = (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback;

export const useCreateClassMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateClassPayload) =>
            classDomainInterface.createClass(payload),
        onSuccess: async (result) => {
            toast.success(
                result.inviteCode
                    ? `班级创建成功，邀请码：${result.inviteCode}`
                    : "班级创建成功",
            );
            await queryClient.invalidateQueries({
                queryKey: classKeys.context(),
            });
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "创建班级失败"));
        },
    });
};

export const useAssignTeacherToClassMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: AssignTeacherPayload) =>
            classDomainInterface.assignTeacherToClass(payload),
        onSuccess: async (_, payload) => {
            toast.success("教师分配成功");
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: classKeys.context(),
                }),
                queryClient.invalidateQueries({
                    queryKey: classKeys.members(payload.classId),
                }),
            ]);
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "教师分配失败"));
        },
    });
};

export const useCreateInviteCodeMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateInviteCodePayload) =>
            classDomainInterface.createInviteCode(payload),
        onSuccess: async (_, payload) => {
            toast.success("邀请码创建成功");
            await queryClient.invalidateQueries({
                queryKey: classKeys.inviteCodes(payload.classId),
            });
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "邀请码创建失败"));
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
            toast.success("邀请码已撤销");
            await queryClient.invalidateQueries({
                queryKey: classKeys.inviteCodes(payload.classId),
            });
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "撤销邀请码失败"));
        },
    });
};

export const useJoinClassByInviteCodeMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: JoinClassByCodePayload) =>
            classDomainInterface.joinClassByInviteCode(payload),
        onSuccess: async (result) => {
            if (result.alreadyJoined) {
                toast.success("你已经在该班级中");
            } else if (result.classSummary.role === "teacher") {
                toast.success("已作为老师加入班级");
            } else {
                toast.success("加入班级成功");
            }
            await queryClient.invalidateQueries({
                queryKey: classKeys.context(),
            });
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "加入班级失败"));
        },
    });
};

export const useRemoveStudentFromClassMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: RemoveStudentPayload) =>
            classDomainInterface.removeStudentFromClass(payload),
        onSuccess: async (_, payload) => {
            toast.success("已移除学生");
            await queryClient.invalidateQueries({
                queryKey: classKeys.members(payload.classId),
            });
            await queryClient.invalidateQueries({
                queryKey: classKeys.context(),
            });
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "移除学生失败"));
        },
    });
};

export const useCreateGroupThreadMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ classId, title }: { classId: string; title: string }) =>
            classDomainInterface.createGroupThread(classId, title),
        onSuccess: async (_, payload) => {
            toast.success("话题已创建");
            await queryClient.invalidateQueries({
                queryKey: classKeys.threads(payload.classId),
            });
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "创建话题失败"));
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
        onError: (error) => {
            toast.error(getErrorMessage(error, "发送消息失败"));
        },
    });
};

export const useSharePrivateChatToClassMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: SharePrivateChatPayload) =>
            classDomainInterface.sharePrivateChatToClass(payload),
        onSuccess: async (thread) => {
            toast.success("分享聊天成功");
            await queryClient.invalidateQueries({
                queryKey: classKeys.threads(thread.classId),
            });
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "分享聊天失败"));
        },
    });
};

export const useShareGradeResultToClassMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: ShareGradeResultPayload) =>
            classDomainInterface.shareGradeResultToClass(payload),
        onSuccess: async (thread) => {
            toast.success("分享反馈成功");
            await queryClient.invalidateQueries({
                queryKey: classKeys.threads(thread.classId),
            });
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "分享反馈失败"));
        },
    });
};
