import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authKeys } from "./authKeys";
import { UserProfile } from "../types/userProfile";
import { authUseCases } from "../infra/authDeps";

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            name: string;
            role: string;
            avatar: string;
        }) => {
            await authUseCases.updateUser({
                name: data.name,
                role: data.role,
                avatar_url: data.avatar,
            });
            return data;
        },
        onMutate: async (data) => {
            await queryClient.cancelQueries({ queryKey: authKeys.profile() });
            const previousProfile = queryClient.getQueryData<UserProfile>(
                authKeys.profile(),
            );
            queryClient.setQueryData<UserProfile>(authKeys.profile(), {
                name: data.name,
                role: data.role,
                avatar: data.avatar,
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
