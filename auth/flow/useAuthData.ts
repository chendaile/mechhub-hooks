import { useSession } from "../queries/useSession";
import { useUserProfile } from "../queries/useUserProfile";

export const useAuthData = () => {
    const { data: session, isLoading } = useSession();
    const { data: userProfile } = useUserProfile(session ?? null);

    return {
        session,
        loading: isLoading,
        userProfile: userProfile,
    };
};
