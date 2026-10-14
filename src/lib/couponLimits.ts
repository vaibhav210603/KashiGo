// Server-only. Usage limits for coupon codes, checked when a payment order is created:
//  - SINGLE_USE: one paid order ever, tracked in Supabase (see supabase/coupon_redemptions.sql).
//  - ONCE_PER_DEVICE: one paid order per browser, tracked in a long-lived cookie.
// Either way the code is tied to the order being created; if that order is never paid,
// the next checkout can take the code over, so abandoning a payment never burns it.
import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import Razorpay from "razorpay";

const SINGLE_USE = new Set(["BLISS20"]);
const ONCE_PER_DEVICE = new Set(["WELCOME10"]);

const USED_MESSAGE = "This code has already been used.";
const DEVICE_USED_MESSAGE = "This code has already been used on this device.";

const normalize = (coupon?: string) => (coupon || "").trim().toUpperCase();
const deviceCookie = (code: string) => `kg_code_${code.toLowerCase()}`;

// Created on first use so a missing Supabase config only affects single-use codes, never the other coupons.
let client: SupabaseClient | null = null;
function supabase() {
    client ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");
    return client;
}

async function rpc(fn: string, args: Record<string, unknown>): Promise<{ data: unknown; error: unknown }> {
    try {
        return await supabase().rpc(fn, args);
    } catch (error) {
        return { data: null, error };
    }
}

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";
const paypalBase = process.env.NODE_ENV === "production" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

// Only a clear "not paid" from the provider frees the code; lookup errors count as paid (fail closed).
async function orderPaid(ref: string): Promise<boolean> {
    const i = ref.indexOf(":");
    const [provider, id] = [ref.slice(0, i), ref.slice(i + 1)];
    if (!id) return false;
    try {
        if (provider === "razorpay") {
            const rz = new Razorpay({ key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!, key_secret: process.env.RAZORPAY_KEY_SECRET! });
            const order: any = await rz.orders.fetch(id);
            return order?.status === "paid" || Number(order?.amount_paid) > 0;
        }
        if (provider === "paypal") {
            const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
            const tok = await fetch(`${paypalBase}/v1/oauth2/token`, {
                method: "POST",
                body: "grant_type=client_credentials",
                headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
            }).then((r) => r.json());
            const res = await fetch(`${paypalBase}/v2/checkout/orders/${encodeURIComponent(id)}`, {
                headers: { Authorization: `Bearer ${tok.access_token}` },
            });
            if (res.status === 404) return false;
            if (!res.ok) throw new Error(`PayPal order lookup failed: ${res.status}`);
            const order = await res.json();
            return order?.status === "COMPLETED" || order?.status === "APPROVED";
        }
        return false; // unknown/forged reference
    } catch (e) {
        console.error("Coupon order check failed:", e);
    }
    return true;
}

function readCookie(req: Request, name: string): string | null {
    const raw = req.headers.get("cookie") || "";
    for (const part of raw.split(";")) {
        const [k, ...v] = part.trim().split("=");
        if (k === name) return decodeURIComponent(v.join("="));
    }
    return null;
}

export type CouponGuard = {
    ok: boolean;
    message?: string;
    // Ties the code to the order just created. False means another checkout took it first.
    commit: (res: NextResponse, orderRef: string) => Promise<boolean>;
};

const free: CouponGuard = { ok: true, commit: async () => true };
const refused = (message: string): CouponGuard => ({ ok: false, message, commit: async () => false });

// Call only when the coupon actually changes the price.
export async function guardCoupon(req: Request, coupon?: string): Promise<CouponGuard> {
    const code = normalize(coupon);

    if (SINGLE_USE.has(code)) {
        const { data, error } = await rpc("coupon_claim_ref", { p_code: code });
        if (error) {
            console.error("Coupon lookup failed:", error);
            return refused("This code can't be used right now — please try again later.");
        }
        const prevRef = data ? String(data) : null;
        if (prevRef && (await orderPaid(prevRef))) return refused(USED_MESSAGE);
        return {
            ok: true,
            commit: async (_res, orderRef) => {
                const { data: claimed, error: claimError } = await rpc("claim_coupon", { p_code: code, p_order_ref: orderRef, p_prev_ref: prevRef });
                if (claimError) console.error("Coupon claim failed:", claimError);
                return !claimError && claimed === true;
            },
        };
    }

    if (ONCE_PER_DEVICE.has(code)) {
        const prevRef = readCookie(req, deviceCookie(code));
        if (prevRef && (await orderPaid(prevRef))) return refused(DEVICE_USED_MESSAGE);
        return {
            ok: true,
            commit: async (res, orderRef) => {
                res.cookies.set(deviceCookie(code), orderRef, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 730 });
                return true;
            },
        };
    }

    return free;
}
