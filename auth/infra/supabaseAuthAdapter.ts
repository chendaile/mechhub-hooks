import { SupabaseAuthService } from "./supabaseAuthService";
import type { AuthPort } from "../application/ports/AuthPort";

export const createSupabaseAuthAdapter = (): AuthPort => ({
    signIn: (email, password) => SupabaseAuthService.signIn(email, password),
    signUp: (email, password, name) =>
        SupabaseAuthService.signUp(email, password, name),
    socialLogin: (provider) => SupabaseAuthService.socialLogin(provider),
    signOut: () => SupabaseAuthService.signOut(),
    getSession: () => SupabaseAuthService.getSession(),
    updateUser: (data) => SupabaseAuthService.updateUser(data),
});
