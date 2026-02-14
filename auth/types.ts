import type { Session } from "@supabase/supabase-js";

export interface UserProfile {
    name: string;
    avatar: string;
    role: string;
}

export type AuthMode = "signin" | "register";

export type AuthSession = Session;
