import { NextResponse } from "next/server";
import { rateLimited } from "@/lib/rateLimit";
import { checkLogin, issueAdminToken, passwordLoginEnabled } from "@/lib/adminToken";
import { requireAdmin } from "@/lib/adminApi";

// GET: is the caller an admin (holds a login token)? Also says whether the ID + password login is set up.
export async function GET(req: Request) {
    const admin = await requireAdmin(req);
    return NextResponse.json({ admin: !(admin instanceof NextResponse), passwordLogin: passwordLoginEnabled() });
}

// POST { username, password } → a 12-hour admin token. Doesn't touch Supabase.
export async function POST(req: Request) {
    if (rateLimited(req, "admin-login", 8, 15 * 60 * 1000)) return NextResponse.json({ error: "Too many attempts — wait 15 minutes." }, { status: 429 });
    if (!passwordLoginEnabled()) return NextResponse.json({ error: "Admin login isn't set up — add ADMIN_USERNAME and ADMIN_PASSWORD in Vercel." }, { status: 400 });
    const { username, password } = await req.json().catch(() => ({ username: "", password: "" }));
    if (!checkLogin(String(username || ""), String(password || ""))) return NextResponse.json({ error: "Wrong ID or password." }, { status: 401 });
    return NextResponse.json({ token: issueAdminToken() });
}
