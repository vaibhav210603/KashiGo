// Server-only helpers shared by the /api/admin routes.
import { NextResponse } from "next/server";
import type { Session } from "@/lib/auth";
import { adminName, verifyAdminToken } from "@/lib/adminToken";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// An admin is whoever holds a token from the ID + password login (X-Admin-Token). Routes that need the database report it themselves.
export async function requireAdmin(req: Request): Promise<Session | NextResponse> {
    if (verifyAdminToken(req.headers.get("x-admin-token"))) return { email: adminName(), userId: "" };
    return NextResponse.json({ error: "Not authorised." }, { status: 403 });
}

// Newest first when the table has created_at; otherwise as stored.
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- PostgREST builder types don't survive being passed around
export async function latest(table: string, build: (q: any) => any, limit = 200) {
    const db = supabaseAdmin();
    let res = await build(db.from(table).select("*")).order("created_at", { ascending: false }).limit(limit);
    if (res.error && String(res.error.message).includes("created_at")) res = await build(db.from(table).select("*")).limit(limit);
    return res;
}

// Characters that would break a PostgREST or() filter are dropped from search text.
export const searchTerm = (q: string | null) => String(q ?? "").replace(/[,()*%\\]/g, " ").trim().slice(0, 60);
