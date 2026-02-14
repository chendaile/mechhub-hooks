import { createSupabaseAuthAdapter } from "../implementation/supabaseAuthPort";
import type { AuthSession } from "../types";
import type { AuthPort, UserUpdateData } from "./AuthPort";

export interface AuthDomainInterface {
    signIn(email: string, password: string): Promise<unknown>;
    signUp(email: string, password: string): Promise<unknown>;
    socialLogin(provider: "google" | "github"): Promise<unknown>;
    signOut(): Promise<void>;
    getSession(): Promise<AuthSession | null>;
    onAuthStateChange(
        callback: (session: AuthSession | null) => void,
    ): () => void;
    updateUser(userUpdateData: UserUpdateData): Promise<void>;
    parseUserProfile(session: AuthSession | null): {
        name: string;
        role: string;
        avatar: string;
    } | null;
}

export const createAuthDomainInterface = (
    authPort: AuthPort,
): AuthDomainInterface => ({
    signIn: (email, password) => authPort.signIn(email, password),
    signUp: (email, password) => authPort.signUp(email, password),
    socialLogin: (provider) => authPort.socialLogin(provider),
    signOut: () => authPort.signOut(),
    getSession: () => authPort.getSession(),
    onAuthStateChange: (callback) => authPort.onAuthStateChange(callback),
    updateUser: (userUpdateData) => authPort.updateUser(userUpdateData),
    parseUserProfile: (session) => authPort.parseUserProfile(session),
});

export const authDomainInterface = createAuthDomainInterface(
    createSupabaseAuthAdapter(),
);
