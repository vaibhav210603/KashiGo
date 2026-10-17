// Server-only Supabase client with the service-role key. It bypasses row-level security, so it must
// never be imported from a client component. Profiles, coins, coupons and refunds all go through it.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function hasServiceRole(): boolean {
    return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function supabaseAdmin(): SupabaseClient {
    if (typeof window !== "undefined") throw new Error("supabaseAdmin is server-only");
    client ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "", {
        auth: { persistSession: false, autoRefreshToken: false },
    });
    return client;
}
