"use client";

// Browser Supabase client — used ONLY for phone OTP login. All data goes through our API routes,
// which check the access token this client keeps (in localStorage) and use the server's service key.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

export function supabaseBrowser(): SupabaseClient | null {
    if (client !== undefined) return client;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    client = url && key ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, storageKey: "kashigo-auth" } }) : null;
    return client;
}
