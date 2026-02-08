import { createAuthUseCases } from "../application/createAuthUseCases";
import { createSupabaseAuthAdapter } from "./supabaseAuthAdapter";

export const authUseCases = createAuthUseCases(createSupabaseAuthAdapter());
