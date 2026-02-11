import { supabase } from "../../shared/supabase";
import { UserUpdateData } from "../interface/AuthPort";
import type { AuthSession } from "../types";
import { UserProfile } from "../types";
import { DEFAULT_USER } from "../constants";

export class SupabaseAuthService {
    static async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    }

    static async signUp(email: string, password: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) throw error;
        return data;
    }

    static async signOut() {
        await supabase.auth.signOut();
    }

    static async getSession(): Promise<AuthSession | null> {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return data.session as AuthSession | null;
    }

    static onAuthStateChange(
        callback: (session: AuthSession | null) => void,
    ): () => void {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            callback(session as AuthSession | null);
        });

        return () => subscription.unsubscribe();
    }

    static async updateUser(userUpdateData: UserUpdateData) {
        const { error } = await supabase.auth.updateUser({
            data: userUpdateData,
        });
        if (error) throw error;
    }

    static parseUserProfile(session: AuthSession | null): UserProfile | null {
        if (!session) return null;
        const metadata = session.user?.user_metadata ?? {};
        return {
            name: metadata.name ?? DEFAULT_USER.name,
            role: metadata.role ?? DEFAULT_USER.role,
            avatar: metadata.avatar ?? DEFAULT_USER.avatar,
        };
    }
}
