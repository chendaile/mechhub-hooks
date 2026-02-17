import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSessionQuery } from "./useSession";
import { uploadAvatar } from "../services/avatarUploadService";

export const useAvatarUploadMutation = () => {
    const { data: session } = useSessionQuery();

    return useMutation({
        mutationFn: async (file: File) => {
            const userId = session?.user.id;
            if (!userId) {
                throw new Error("未登录，无法上传头像");
            }
            return uploadAvatar(userId, file);
        },
        onError: (error) => {
            const message =
                error instanceof Error ? error.message : "头像上传失败";
            toast.error(message);
        },
    });
};
