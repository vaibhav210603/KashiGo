// Server-only. Site-wide discount codes (the `coupons` table, managed in /admin) on quotation payments.
// A use is reserved against the Razorpay order when it's created and counted as paid when the payment verifies.
import { couponMessage, couponStatus, getRule } from "@/lib/coupons";
import { planProblem, ruleApplies, type PayPlan } from "@/lib/pricing";
import { razorpay } from "@/lib/quotePayments";
import { quoteReceipt, type Quote, type SiteCoupon } from "@/lib/quotes";
import { hasServiceRole, supabaseAdmin } from "@/lib/supabaseAdmin";

type Q = Pick<Quote, "id" | "customer" | "ride">;

const product = (q: Q) => (q.ride.packageId === "custom" ? "custom-boat" : q.ride.packageId);
// Per-customer limits count by email: the customer's on the quote, else one stand-in per quotation.
const customer = (q: Q) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(q.customer.email ?? "") ? q.customer.email! : `quote-${q.id}@quotes.kashigo.in`).toLowerCase();
const ref = (orderId: string) => `razorpay:${orderId}`;
const MISSING = ["PGRST202", "42883"]; // coupon functions not installed yet: codes still work, without usage limits

// `plan`: how the customer is paying — WELCOME10 works only with 50/50, WELCOME20 only with full online payment.
export async function checkSiteCoupon(q: Q, code: unknown, plan: PayPlan): Promise<{ ok: true; coupon: SiteCoupon } | { ok: false; message: string }> {
    const c = String(code ?? "").trim().toUpperCase();
    const wrongPlan = planProblem(c, plan);
    if (wrongPlan) return { ok: false, message: wrongPlan };
    // Rule and usage are looked up together (one round trip, not two); the rule still decides first.
    const [rule, status] = await Promise.all([getRule(c), c ? couponStatus(c, customer(q)) : "not_found"]);
    if (!rule) return { ok: false, message: "That code isn't valid." };
    if (!ruleApplies(rule, product(q))) return { ok: false, message: "That code doesn't apply to this quotation." };
    if (rule.kind === "fixed_price") return { ok: false, message: "This code can't be used on a quotation." };
    if (status !== "ok") return { ok: false, message: couponMessage(status) };
    return { ok: true, coupon: { code: rule.code, kind: rule.kind, value: rule.value } };
}

// The page's preview: no Razorpay calls on the common path ("order" re-checks everything before charging).
// Only when the limit looks reached — possibly by this quotation's own unpaid checkout — free those holds and look again.
export async function previewSiteCoupon(q: Q, code: unknown, plan: PayPlan) {
    const c = await checkSiteCoupon(q, code, plan);
    if (c.ok || ![couponMessage("customer_limit"), couponMessage("used_up")].includes(c.message)) return c;
    await releaseUnpaidQuoteHolds(q);
    return checkSiteCoupon(q, code, plan);
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
