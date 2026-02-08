import type { UserProfile } from "../types/userProfile";

interface SessionLike {
    user?: {
        user_metadata?: {
            name?: string;
            avatar_url?: string;
            role?: string;
        };
    };
}

export const parseUserProfile = (
    session: SessionLike | null,
    defaultUser: UserProfile,
): UserProfile => {
    if (!session?.user?.user_metadata) {
        return defaultUser;
    }

    const { name, avatar_url, role } = session.user.user_metadata;
    return {
        name: name || defaultUser.name,
        avatar: avatar_url || defaultUser.avatar,
        role: role || defaultUser.role,
    };
};
