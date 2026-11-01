// Server-only. Site-wide discount codes (the `coupons` table, managed in /admin) on quotation payments.
// A use is reserved against the Razorpay order when it's created and counted as paid when the payment verifies.
import { couponMessage, couponStatus, getRule } from "@/lib/coupons";
import { ruleApplies } from "@/lib/pricing";
import { razorpay } from "@/lib/quotePayments";
import { quoteReceipt, type Quote, type SiteCoupon } from "@/lib/quotes";
import { hasServiceRole, supabaseAdmin } from "@/lib/supabaseAdmin";

type Q = Pick<Quote, "id" | "customer" | "ride">;

const product = (q: Q) => (q.ride.packageId === "custom" ? "custom-boat" : q.ride.packageId);
// Per-customer limits count by email: the customer's on the quote, else one stand-in per quotation.
const customer = (q: Q) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(q.customer.email ?? "") ? q.customer.email! : `quote-${q.id}@quotes.kashigo.in`).toLowerCase();
const ref = (orderId: string) => `razorpay:${orderId}`;
const MISSING = ["PGRST202", "42883"]; // coupon functions not installed yet: codes still work, without usage limits

export async function checkSiteCoupon(q: Q, code: unknown): Promise<{ ok: true; coupon: SiteCoupon } | { ok: false; message: string }> {
    const rule = await getRule(String(code ?? ""));
    if (!rule) return { ok: false, message: "That code isn't valid." };
    if (!ruleApplies(rule, product(q))) return { ok: false, message: "That code doesn't apply to this quotation." };
    if (rule.kind === "fixed_price") return { ok: false, message: "This code can't be used on a quotation." };
    const status = await couponStatus(rule.code, customer(q));
    if (status !== "ok") return { ok: false, message: couponMessage(status) };
    return { ok: true, coupon: { code: rule.code, kind: rule.kind, value: rule.value } };
}

// A customer who closed the checkout and tries again mustn't be told they've already used the code:
// free the uses held by this quotation's earlier, unpaid Razorpay orders.
export async function releaseUnpaidQuoteHolds(q: Q, keepOrderId?: string) {
    if (!hasServiceRole() || !process.env.RAZORPAY_KEY_SECRET) return;
    try {
        const list: any = await razorpay().orders.all({ receipt: quoteReceipt(q) } as any);
        for (const o of list?.items ?? []) {
            if (o.id !== keepOrderId && o.status === "created") await supabaseAdmin().rpc("coupon_release", { p_ref: ref(o.id) });
        }
    } catch (e) {
        console.error("Releasing quote coupon holds failed:", e);
    }
}

// Error message, or null once the use is held for this order.
export async function reserveSiteCoupon(q: Q, code: string, orderId: string): Promise<string | null> {
    if (!hasServiceRole()) return null;
    const { data, error } = await supabaseAdmin().rpc("coupon_reserve", { p_code: code, p_email: customer(q), p_ref: ref(orderId) });
    if (error && !MISSING.includes(String(error.code))) return "This code can't be used right now — please try again.";
    if (!error && data !== "ok") return couponMessage(String(data));
    return null;
}

export async function siteCouponPaid(orderId: string) {
    if (!hasServiceRole()) return;
    const { error } = await supabaseAdmin().rpc("coupon_paid", { p_ref: ref(orderId) });
    if (error && !MISSING.includes(String(error.code))) console.error("Marking quote coupon paid failed:", error);
}
