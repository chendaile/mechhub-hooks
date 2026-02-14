import { useAuthData } from "./useAuthData";
import { useAuthShowState } from "../ui/useAuthShowState";

export const useAuthSessionFlow = () => {
    const { session, loading } = useAuthData();
    const { showAuth, setShowAuth } = useAuthShowState();

    return {
        state: {
            session,
            loading,
            showAuth,
        },
        actions: {
            setShowAuth,
        },
    };
};
