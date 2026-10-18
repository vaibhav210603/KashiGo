// Emails are the key of a customer's profile (coins, coupons, refunds), so every one is stored the same way:
// trimmed and lower-case. Safe to import from client and server code.
export function normalizeEmail(raw: string | null | undefined): string | null {
    const e = String(raw ?? "").trim().toLowerCase();
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e) && e.length <= 254 ? e : null;
}
