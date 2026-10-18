// Server-side identity. The browser logs in with Supabase (email code or Google) and sends its access token
// as "Authorization: Bearer …"; we ask Supabase who it belongs to and use the verified email address.
import { normalizeEmail } from "@/lib/email";
import { hasServiceRole, supabaseAdmin } from "@/lib/supabaseAdmin";

export type Session = { email: string; userId: string };

export async function getSession(req: Request): Promise<Session | null> {
    const header = req.headers.get("authorization") || "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
    if (!token || !hasServiceRole()) return null;
    try {
        const { data, error } = await supabaseAdmin().auth.getUser(token);
        const email = normalizeEmail(data.user?.email);
        if (error || !data.user || !email) return null;
        // Make sure the profile exists and points at this login (bookings and refunds may have created it earlier).
        const name = (data.user.user_metadata?.full_name || data.user.user_metadata?.name || null) as string | null;
        await supabaseAdmin().rpc("ensure_profile", { p_email: email, p_name: name, p_user_id: data.user.id });
        return { email, userId: data.user.id };
    } catch (e) {
        console.error("Session check failed:", e);
        return null;
    }
}

// Admins are the email addresses listed in ADMIN_EMAILS (comma-separated).
export function isAdmin(email: string | null | undefined): boolean {
    if (!email) return false;
    const list = (process.env.ADMIN_EMAILS || "").split(",").map((e) => normalizeEmail(e)).filter(Boolean);
    return list.includes(email);
}

export async function getAdmin(req: Request): Promise<Session | null> {
    const s = await getSession(req);
    return s && isAdmin(s.email) ? s : null;
}
