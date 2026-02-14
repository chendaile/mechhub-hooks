import { useAuthActionsFlow } from "./useAuthActionsFlow";
import { useAuthData } from "./useAuthData";

export const useAuthProfileFlow = () => {
    const { userProfile } = useAuthData();
    const { handleUpdateProfile, handleSignOut, isUpdating } =
        useAuthActionsFlow();

    return {
        state: {
            userProfile,
            isUpdating,
        },
        actions: {
            handleUpdateProfile,
            handleSignOut,
        },
    };
};
