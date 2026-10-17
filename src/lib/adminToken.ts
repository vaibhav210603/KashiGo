// Server-only. Admin login that doesn't depend on Supabase: ADMIN_PASSWORD (env) is exchanged for a signed,
// expiring token, so /admin keeps working (orders from email) even when the database or Supabase Auth is down.
import crypto from "crypto";

const TTL_MS = 12 * 60 * 60 * 1000;

function key(): Buffer | null {
    const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
    return secret ? crypto.createHash("sha256").update(`kashigo-admin:${secret}`).digest() : null;
}

const sign = (payload: string, k: Buffer) => crypto.createHmac("sha256", k).update(payload).digest("base64url");

export const passwordLoginEnabled = () => Boolean(process.env.ADMIN_PASSWORD);

export function checkPassword(password: string): boolean {
    const want = process.env.ADMIN_PASSWORD || "";
    if (!want || !password) return false;
    const a = crypto.createHash("sha256").update(password).digest();
    const b = crypto.createHash("sha256").update(want).digest();
    return crypto.timingSafeEqual(a, b);
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
