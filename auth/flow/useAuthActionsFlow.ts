import { useUpdateProfileMutation } from "../queries/useUpdateProfile";
import { authDomainInterface } from "../interface/AuthDomainInterface";

export const useAuthActionsFlow = () => {
    const updateProfileMutation = useUpdateProfileMutation();

    const handleUpdateProfile = (name: string, avatar: string) => {
        updateProfileMutation.mutate({ name, avatar });
    };

    const handleSignOut = async () => {
        await authDomainInterface.signOut();
    };

    return {
        handleUpdateProfile,
        handleSignOut,
        isUpdating: updateProfileMutation.isPending,
    };
};
