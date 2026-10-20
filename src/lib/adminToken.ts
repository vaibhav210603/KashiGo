// Server-only. The only way into /admin: ADMIN_USERNAME + ADMIN_PASSWORD (env, never in the repo — it's public) are
// exchanged for a signed, expiring token. No Supabase involved, so /admin works even when Supabase is down.
import crypto from "crypto";

const TTL_MS = 12 * 60 * 60 * 1000;

function key(): Buffer | null {
    const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
    return secret ? crypto.createHash("sha256").update(`kashigo-admin:${secret}`).digest() : null;
}

const sign = (payload: string, k: Buffer) => crypto.createHmac("sha256", k).update(payload).digest("base64url");

export const passwordLoginEnabled = () => Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD);
export const adminName = () => process.env.ADMIN_USERNAME || "admin";

const same = (given: string, want: string) =>
    crypto.timingSafeEqual(crypto.createHash("sha256").update(given).digest(), crypto.createHash("sha256").update(want).digest());

export function checkLogin(username: string, password: string): boolean {
    const wantUser = process.env.ADMIN_USERNAME || "";
    const wantPass = process.env.ADMIN_PASSWORD || "";
    if (!wantUser || !wantPass || !username || !password) return false;
    // Both are always compared, so a wrong username takes as long as a wrong password.
    const userOk = same(username.trim().toLowerCase(), wantUser.trim().toLowerCase());
    const passOk = same(password, wantPass);
    return userOk && passOk;
}

export function issueAdminToken(): string | null {
    const k = key();
    if (!k) return null;
    const payload = `admin.${Date.now() + TTL_MS}`;
    return `${payload}.${sign(payload, k)}`;
}

export function verifyAdminToken(token: string | null | undefined): boolean {
    const k = key();
    if (!k || !token) return false;
    const i = token.lastIndexOf(".");
    const payload = token.slice(0, i);
    const sig = token.slice(i + 1);
    const expected = sign(payload, k);
    if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
    const exp = Number(payload.split(".")[1]);
    return payload.startsWith("admin.") && exp > Date.now();
}
