// Server-only. Coupons live in the `coupons` table and are managed from /admin, so a new code works
// the moment it's created. Using a code requires logging in; per-customer limits count per email.
import { LEGACY_RULES, priceOf, ruleApplies, type CouponRule, type Price } from "@/lib/pricing";
import { hasServiceRole, supabaseAdmin } from "@/lib/supabaseAdmin";

const normalize = (code?: string | null) => String(code ?? "").trim().toUpperCase();

// Postgres/PostgREST codes for "that table or function doesn't exist" — i.e. the migration hasn't run.
const MISSING = new Set(["42P01", "PGRST205", "PGRST202", "42883"]);
const isMissing = (error: { code?: string } | null) => !!error && MISSING.has(String(error.code));

let tableReady: boolean | null = null; // remembered once we know

export async function getRule(code?: string | null): Promise<CouponRule | null> {
    const c = normalize(code);
    if (!c) return null;
    if (hasServiceRole() && tableReady !== false) {
        const { data, error } = await supabaseAdmin().from("coupons").select("code, kind, value, applies_to").eq("code", c).maybeSingle();
        if (!error) {
            tableReady = true;
            return data ? { ...data, value: Number(data.value) } as CouponRule : null;
        }
        if (isMissing(error)) tableReady = false;
        else console.error("Coupon lookup failed:", error);
    }
    return LEGACY_RULES.find((r) => r.code === c) ?? null;
}

const STATUS_MESSAGES: Record<string, string> = {
    not_found: "That code isn't valid.",
    inactive: "This code is no longer active.",
    not_started: "This code isn't live yet.",
    expired: "This code has expired.",
    used_up: "This code has already been used.",
    customer_limit: "You've already used this code.",
};
export const couponMessage = (status: string) => STATUS_MESSAGES[status] ?? "That code can't be used right now.";

export type Quote = { ok: true; price: Price; base: Price; rule: CouponRule | null } | { ok: false; message: string };

// What this customer would pay for the product with this code, after checking the code can be used by them.
export async function quote(product: string, code: string | null | undefined, email: string | null): Promise<Quote> {
    const base = priceOf(product);
    if (!base) return { ok: false, message: "Unknown product." };
    if (!normalize(code)) return { ok: true, price: base, base, rule: null };
    if (!email) return { ok: false, message: "Log in to use a code." };

    const rule = await getRule(code);
    if (!rule || !ruleApplies(rule, product)) return { ok: false, message: "That code doesn't apply to this." };
    const status = await couponStatus(rule.code, email);
    if (status !== "ok") return { ok: false, message: couponMessage(status) };
    const price = priceOf(product, rule)!;
    if (price.inr >= base.inr) return { ok: false, message: "That code doesn't change the price of this." };
    return { ok: true, price, base, rule };
}

export async function couponStatus(code: string, email: string): Promise<string> {
    if (!hasServiceRole() || tableReady === false) return "ok"; // legacy mode: no usage tracking available
    const { data, error } = await supabaseAdmin().rpc("coupon_status", { p_code: code, p_email: email });
    if (error) {
        if (isMissing(error)) { tableReady = false; return "ok"; }
        console.error("Coupon status failed:", error);
        return "error";
    }
    return String(data);
}
