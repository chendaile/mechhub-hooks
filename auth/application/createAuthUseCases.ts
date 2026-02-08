import type { UserProfile } from "../types/userProfile";
import { parseUserProfile } from "../domain/parseUserProfile";
import type { AuthPort, UpdateUserInput } from "./ports/AuthPort";

export const createAuthUseCases = (authPort: AuthPort) => ({
    signIn: (email: string, password: string) => authPort.signIn(email, password),
    signUp: (email: string, password: string, name?: string) =>
        authPort.signUp(email, password, name),
    socialLogin: (provider: "google" | "github") =>
        authPort.socialLogin(provider),
    signOut: () => authPort.signOut(),
    getSession: () => authPort.getSession(),
    updateUser: (data: UpdateUserInput) => authPort.updateUser(data),
    parseUserProfile: (
        session: Parameters<typeof parseUserProfile>[0],
        defaultUser: UserProfile,
    ) =>
        parseUserProfile(session, defaultUser),
});

export type AuthUseCases = ReturnType<typeof createAuthUseCases>;
