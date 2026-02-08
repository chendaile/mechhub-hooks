import type { Session } from "@supabase/supabase-js";

export interface UpdateUserInput {
    name?: string;
    role?: string;
    avatar_url?: string;
}

export interface AuthPort {
    signIn(email: string, password: string): Promise<unknown>;
    signUp(email: string, password: string, name?: string): Promise<unknown>;
    socialLogin(provider: "google" | "github"): Promise<unknown>;
    signOut(): Promise<void>;
    getSession(): Promise<Session | null>;
    updateUser(data: UpdateUserInput): Promise<void>;
}
