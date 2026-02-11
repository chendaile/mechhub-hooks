import { SupabaseAuthService } from "./supabaseAuthService";
import { AuthPort } from "../interface/AuthPort";

export const createSupabaseAuthAdapter = (): AuthPort => ({
    signIn: (email, password) => SupabaseAuthService.signIn(email, password),
    signUp: (email, password) => SupabaseAuthService.signUp(email, password),
    socialLogin: (provider) => SupabaseAuthService.socialLogin(provider),
    signOut: () => SupabaseAuthService.signOut(),
    getSession: () => SupabaseAuthService.getSession(),
    onAuthStateChange: (callback) =>
        SupabaseAuthService.onAuthStateChange(callback),
    updateUser: (userUpdateData) =>
        SupabaseAuthService.updateUser(userUpdateData),
    parseUserProfile: (session) =>
        SupabaseAuthService.parseUserProfile(session),
});
