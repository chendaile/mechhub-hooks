import { useAuthData } from "./useAuthData";
import { useAuthActionsFlow } from "./useAuthActionsFlow";
import { useAuthShowState } from "../ui/useAuthShowState";

export const useAuthFlow = () => {
    const { session, loading, userProfile } = useAuthData();
    const { handleUpdateProfile, handleSignOut, isUpdating } =
        useAuthActionsFlow();
    const { showAuth, setShowAuth } = useAuthShowState();

    return {
        session,
        loading,
        userProfile,
        showAuth,
        setShowAuth,
        handleUpdateProfile,
        handleSignOut,
        isUpdating,
    };
};
