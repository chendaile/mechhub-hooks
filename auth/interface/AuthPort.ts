import type { AuthSession } from "../types";
import { UserProfile } from "../types";

export interface UserUpdateData {
    name?: string;
    role?: string;
    avatar?: string;
}

export interface AuthPort {
    signIn(email: string, password: string): Promise<unknown>;
    signUp(email: string, password: string): Promise<unknown>;
    socialLogin(provider: "google" | "github"): Promise<unknown>;
    signOut(): Promise<void>;
    getSession(): Promise<AuthSession | null>;
    onAuthStateChange(
        callback: (session: AuthSession | null) => void,
    ): () => void;
    updateUser(userUpdateData: UserUpdateData): Promise<void>;
    parseUserProfile(session: AuthSession | null): UserProfile | null;
}
