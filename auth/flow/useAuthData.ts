import { useSessionQuery } from "../queries/useSession";
import { useUserProfileQuery } from "../queries/useUserProfile";

export const useAuthData = () => {
    const { data: session, isLoading } = useSessionQuery();
    const { data: userProfile } = useUserProfileQuery(session ?? null);

    return {
        session,
        loading: isLoading,
        userProfile: userProfile,
    };
};
