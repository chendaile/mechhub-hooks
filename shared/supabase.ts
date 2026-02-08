import { createClient } from "@supabase/supabase-js";

export const projectId = "vcdxjwkfpiakszgsynro";
export const publicAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjZHhqd2tmcGlha3N6Z3N5bnJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NjU4NzMsImV4cCI6MjA4NDM0MTg3M30._-okDVqHHapiAerWzzT1r80p-Kgn09B6KqOaHzjFJzw";

export const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabase = createClient(supabaseUrl, publicAnonKey);
