import { supabase } from "../../shared/supabase";

export class SupabaseAuthService {
    static async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    }

    static async signUp(
        email: string,
        password: string,
        name: string = "Student",
    ) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                },
            },
        });

        if (error) throw error;
        return data;
    }

    static async socialLogin(provider: "google" | "github") {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
        });
        if (error) throw error;
        return data;
    }

    static async signOut() {
        await supabase.auth.signOut();
    }

    static async getSession() {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return data.session;
    }

    static async updateUser(data: {
        name?: string;
        role?: string;
        avatar_url?: string;
    }) {
        const { error } = await supabase.auth.updateUser({
            data,
        });
        if (error) throw error;
    }
}
