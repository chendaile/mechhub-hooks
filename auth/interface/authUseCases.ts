import type { AuthPort, UserUpdateData } from "./AuthPort";
import { createSupabaseAuthAdapter } from "../implementation/supabaseAuthPort";
import type { AuthSession } from "../types";

const createAuthUseCases = (authPort: AuthPort) => ({
    signIn: (email: string, password: string) =>
        authPort.signIn(email, password),
    signUp: (email: string, password: string) =>
        authPort.signUp(email, password),
    signOut: () => authPort.signOut(),
    getSession: () => authPort.getSession(),
    onAuthStateChange: (callback: (session: AuthSession | null) => void) =>
        authPort.onAuthStateChange(callback),
    updateUser: (userUpdateData: UserUpdateData) =>
        authPort.updateUser(userUpdateData),
    parseUserProfile: (session: AuthSession | null) =>
        authPort.parseUserProfile(session),
});

export const authUseCases = createAuthUseCases(createSupabaseAuthAdapter());
