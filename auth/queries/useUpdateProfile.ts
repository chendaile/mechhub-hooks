import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authKeys } from "./authKeys";
import { UserProfile } from "../types";
import { authUseCases } from "../interface/authUseCases";
import type { UserUpdateData } from "../interface/AuthPort";
import { DEFAULT_USER } from "../constants";

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UserUpdateData) => {
            await authUseCases.updateUser(data);
        },
        onMutate: async (data) => {
            await queryClient.cancelQueries({ queryKey: authKeys.profile() });
            const previousProfile = queryClient.getQueryData<UserProfile>(
                authKeys.profile(),
            );
            queryClient.setQueryData<UserProfile>(authKeys.profile(), {
                name: data.name ?? previousProfile?.name ?? DEFAULT_USER.name,
                role: data.role ?? previousProfile?.role ?? DEFAULT_USER.role,
                avatar:
                    data.avatar ?? previousProfile?.avatar ?? DEFAULT_USER.avatar,
            });

            return { previousProfile };
        },
        onError: (_error, _data, context) => {
            if (context?.previousProfile) {
                queryClient.setQueryData(
                    authKeys.profile(),
                    context.previousProfile,
                );
            }
            toast.error("更新个人信息失败");
        },
        onSuccess: () => {
            toast.success("个人信息已更新");
        },
    });
};
