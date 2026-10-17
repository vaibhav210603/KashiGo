import { NextResponse } from "next/server";
import { rateLimited } from "@/lib/rateLimit";
import { checkPassword, issueAdminToken, passwordLoginEnabled } from "@/lib/adminToken";
import { requireAdmin } from "@/lib/adminApi";

// GET: is the caller an admin (OTP or password token)? Also says whether password login is set up.
export async function GET(req: Request) {
    const admin = await requireAdmin(req);
    return NextResponse.json({ admin: !(admin instanceof NextResponse), passwordLogin: passwordLoginEnabled() });
}

// POST { password } → a 12-hour admin token. Doesn't touch Supabase.
export async function POST(req: Request) {
    if (rateLimited(req, "admin-login", 8, 15 * 60 * 1000)) return NextResponse.json({ error: "Too many attempts — wait 15 minutes." }, { status: 429 });
    if (!passwordLoginEnabled()) return NextResponse.json({ error: "Password login isn't set up (ADMIN_PASSWORD)." }, { status: 400 });
    const { password } = await req.json().catch(() => ({ password: "" }));
    if (!checkPassword(String(password || ""))) return NextResponse.json({ error: "Wrong password." }, { status: 401 });
    return NextResponse.json({ token: issueAdminToken() });
}
