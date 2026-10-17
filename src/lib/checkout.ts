// Server-only. Everything that happens between "Pay" and "confirmed" for coupons and KashiGo coins:
//  1. prepareCheckout() prices the order (coupon checked against the logged-in phone, coins applied),
//  2. commit(ref) ties the coupon use and the held coins to the payment-provider order just created,
//  3. finalize(ref) once the payment is verified — or abandon(ref) / releaseStaleHolds() if it never happens.
// Refs look like "razorpay:order_…", "paypal:…" or "credits:…" (paid entirely in coins).
import Razorpay from "razorpay";
import { INR_PER_USD } from "@/lib/boatPrices";
import { getSession } from "@/lib/auth";
import { couponMessage, quote } from "@/lib/coupons";
import type { CouponRule } from "@/lib/pricing";
import { hasServiceRole, supabaseAdmin } from "@/lib/supabaseAdmin";

export type Provider = "razorpay" | "paypal" | "credits";

export type Prepared =
    | {
        ok: true;
        phone: string | null;
        product: string;
        rule: CouponRule | null;
        listInr: number;   // price after the coupon, before coins
        listUsd: number;
        creditsInr: number; // coins applied
        payInr: number;    // left to pay by Razorpay
        payUsd: number;    // left to pay by PayPal
        commit: (ref: string) => Promise<string | null>; // error message, or null when everything is reserved
    }
    | { ok: false; message: string; status: number };

const round2 = (n: number) => Math.round(n * 100) / 100;
const db = () => supabaseAdmin();

export async function getBalance(phone: string): Promise<number> {
    if (!hasServiceRole()) return 0;
    const { data } = await db().from("profiles").select("credits_inr").eq("phone", phone).maybeSingle();
    return Number(data?.credits_inr ?? 0);
}

export async function prepareCheckout(req: Request, opts: { product: string; coupon?: string | null; useCredits?: boolean; provider: Provider }): Promise<Prepared> {
    const session = await getSession(req);
    const phone = session?.phone ?? null;
    const wantsCoins = opts.useCredits || opts.provider === "credits";
    if (wantsCoins && !phone) return { ok: false, message: "Log in with your phone number to use your KashiGo coins.", status: 401 };

    const q = await quote(opts.product, opts.coupon, phone);
    if (!q.ok) return { ok: false, message: q.message, status: q.message.startsWith("Log in") ? 401 : 409 };
    const { inr, usd } = q.price;

    let credits = 0;
    if (wantsCoins && phone) {
        await releaseStaleHolds(phone);
        const balance = await getBalance(phone);
        if (opts.provider === "credits") {
            if (balance < inr) return { ok: false, message: "You don't have enough KashiGo coins for this.", status: 409 };
            credits = inr;
        } else {
            // Leave at least ₹1 / $0.01 for the payment provider; if coins cover everything the client uses "credits".
            const cap = opts.provider === "paypal" ? Math.floor((usd - 0.01) * INR_PER_USD) : inr - 1;
            credits = Math.max(0, Math.min(balance, cap, inr - 1));
        }
    }

    return {
        ok: true,
        phone,
        product: opts.product,
        rule: q.rule,
        listInr: inr,
        listUsd: usd,
        creditsInr: credits,
        payInr: inr - credits,
        payUsd: round2(Math.max(0.01, usd - credits / INR_PER_USD)),
        commit: async (ref) => {
            if (!hasServiceRole()) return credits > 0 ? "Coins aren't available right now." : null;
            if (q.rule && phone) {
                const { data, error } = await db().rpc("coupon_reserve", { p_code: q.rule.code, p_phone: phone, p_ref: ref });
                // Missing function = migration not run yet: legacy codes still work, just without usage limits.
                if (error && !["PGRST202", "42883"].includes(String(error.code))) return "This code can't be used right now — please try again.";
                if (!error && data !== "ok") return couponMessage(String(data));
            }
            if (credits > 0 && phone) {
                const { data, error } = await db().rpc("credit_hold", { p_phone: phone, p_amount: credits, p_ref: ref, p_product: opts.product });
                if (error || data !== true) {
                    await db().rpc("coupon_release", { p_ref: ref });
                    return "Your coin balance changed — please try again.";
                }
            }
            return null;
        },
    };
}

// Coupon and coins attached to a checkout, as recorded when it was created.
export async function refInfo(ref: string): Promise<{ coupon: string | null; creditsInr: number; phone: string | null; product: string | null }> {
    if (!hasServiceRole() || !ref) return { coupon: null, creditsInr: 0, phone: null, product: null };
    const [use, hold] = await Promise.all([
        db().from("coupon_uses").select("code, phone").eq("order_ref", ref).maybeSingle(),
        db().from("credit_holds").select("amount_inr, phone, product, status").eq("ref", ref).maybeSingle(),
    ]);
    const h = hold.data && hold.data.status !== "released" ? hold.data : null;
    return {
        coupon: use.data?.code ?? null,
        creditsInr: Number(h?.amount_inr ?? 0),
        phone: h?.phone ?? use.data?.phone ?? null,
        product: h?.product ?? null,
    };
}

// Payment verified: coins are spent and the coupon use counts.
export async function finalize(ref: string) {
    if (!hasServiceRole() || !ref) return;
    await Promise.all([db().rpc("credit_settle", { p_ref: ref }), db().rpc("coupon_paid", { p_ref: ref })]);
}

// The checkout won't be paid: return the coins and free the coupon.
export async function abandon(ref: string) {
    if (!hasServiceRole() || !ref) return;
    await Promise.all([db().rpc("credit_release", { p_ref: ref }), db().rpc("coupon_release", { p_ref: ref })]);
}

// Coins held for a provider checkout that was never paid come back after 20 minutes.
// A checkout the provider says WAS paid stays held — the owner can see it in /admin.
export async function releaseStaleHolds(phone: string) {
    if (!hasServiceRole()) return;
    const cutoff = new Date(Date.now() - 20 * 60 * 1000).toISOString();
    const { data } = await db().from("credit_holds").select("ref").eq("phone", phone).eq("status", "held").lt("created_at", cutoff).limit(20);
    for (const { ref } of data ?? []) {
        if (String(ref).startsWith("credits:")) continue; // paid in coins in the same request as the order
        if (!(await orderPaid(ref))) await abandon(ref);
    }
}

export async function saveProfile(phone: string | null, name?: string, email?: string) {
    if (!phone || !hasServiceRole()) return;
    const { error } = await db().rpc("ensure_profile", { p_phone: phone, p_name: name || null, p_email: email || null });
    if (error) console.error("Profile save failed:", error);
}

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";
const paypalBase = process.env.NODE_ENV === "production" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

// Only a clear "not paid" from the provider counts as unpaid; lookup errors count as paid (fail closed).
export async function orderPaid(ref: string): Promise<boolean> {
    const i = ref.indexOf(":");
    const [provider, id] = [ref.slice(0, i), ref.slice(i + 1)];
    if (!id) return false;
    try {
        if (provider === "razorpay") {
            const rz = new Razorpay({ key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!, key_secret: process.env.RAZORPAY_KEY_SECRET! });
            const order = (await rz.orders.fetch(id)) as { status?: string; amount_paid?: number | string };
            return order?.status === "paid" || Number(order?.amount_paid) > 0;
        }
        if (provider === "paypal") {
            const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
            const tok = await fetch(`${paypalBase}/v1/oauth2/token`, {
                method: "POST",
                body: "grant_type=client_credentials",
                headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
            }).then((r) => r.json());
            const res = await fetch(`${paypalBase}/v2/checkout/orders/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${tok.access_token}` } });
            if (res.status === 404) return false;
            if (!res.ok) throw new Error(`PayPal order lookup failed: ${res.status}`);
            const order = await res.json();
            return order?.status === "COMPLETED" || order?.status === "APPROVED";
        }
        return true; // credits: and anything unknown — never auto-release
    } catch (e) {
        console.error("Order paid check failed:", e);
    }
    return true;
}
