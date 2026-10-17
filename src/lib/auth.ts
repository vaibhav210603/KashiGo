// Server-side identity. The browser logs in with Supabase phone OTP and sends its access token as
// "Authorization: Bearer …"; we ask Supabase who it belongs to and use the verified phone number.
import { normalizePhone } from "@/lib/phone";
import { hasServiceRole, supabaseAdmin } from "@/lib/supabaseAdmin";

export type Session = { phone: string; userId: string };

export async function getSession(req: Request): Promise<Session | null> {
    const header = req.headers.get("authorization") || "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
    if (!token || !hasServiceRole()) return null;
    try {
        const { data, error } = await supabaseAdmin().auth.getUser(token);
        if (error || !data.user?.phone) return null;
        // Supabase stores phones without the "+".
        const phone = normalizePhone(`+${data.user.phone.replace(/^\+/, "")}`);
        if (!phone) return null;
        // Make sure the profile exists and points at this login (refunds may have created it earlier).
        await supabaseAdmin().rpc("ensure_profile", { p_phone: phone, p_user_id: data.user.id });
        return { phone, userId: data.user.id };
    } catch (e) {
        console.error("Session check failed:", e);
        return null;
    }
}

// Admins are the phone numbers listed in ADMIN_PHONES (comma-separated, any format).
export function isAdmin(phone: string | null | undefined): boolean {
    if (!phone) return false;
    const list = (process.env.ADMIN_PHONES || "").split(",").map((p) => normalizePhone(p)).filter(Boolean);
    return list.includes(phone);
}

export async function getAdmin(req: Request): Promise<Session | null> {
    const s = await getSession(req);
    return s && isAdmin(s.phone) ? s : null;
}
