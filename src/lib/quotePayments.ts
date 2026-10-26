// Server-only Razorpay helpers for quotation pages.
import Razorpay from "razorpay";
import { quoteReceipt, type Quote } from "@/lib/quotes";
import type { OrderRecord } from "@/lib/orderMail";

export const razorpay = () => new Razorpay({ key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!, key_secret: process.env.RAZORPAY_KEY_SECRET! });

export type PaidOrder = { amountInr: number; choices: string; dueInr: number }; // dueInr: still to collect at the ghat (50% advance quotes)

// The paid Razorpay order for this quote, if any — the page shows "Paid" and the API refuses a second charge.
export async function paidQuoteOrder(q: Quote): Promise<PaidOrder | null> {
    if (!process.env.RAZORPAY_KEY_SECRET) return null;
    try {
        const list: any = await razorpay().orders.all({ receipt: quoteReceipt(q) } as any);
        const o = (list?.items ?? []).find((o: any) => o.status === "paid");
        return o ? { amountInr: Number(o.amount) / 100, choices: String(o.notes?.choices ?? ""), dueInr: Number(o.notes?.due) || 0 } : null;
    } catch {
        return null;
    }
}

export const isQuotePaid = async (q: Quote) => (await paidQuoteOrder(q)) !== null;

/* ───────────── Quote payments as boat bookings (admin orders + history) ───────────── */

// Everyone on board: the lead passenger plus the names in "Extra passengers: A (30), B".
export function paxFromChoices(choices: string): number {
    const m = /Extra passengers: ([^|]+)/.exec(choices);
    const extra = m && m[1].trim() !== "none" ? m[1].split(",").filter((s) => s.trim()).length : 0;
    return 1 + extra;
}

// One paid quotation, in the same shape as a site booking, keyed by the quote id (a quote can be paid only once).
export function quoteOrderRecord(q: Quote, order: any, payment: any): OrderRecord {
    const choices = String(order?.notes?.choices ?? "");
    const coupon = /Coupon: (\S+)/.exec(choices)?.[1] ?? null;
    const due = Number(order?.notes?.due) || 0; // 50%-advance quotes: the rest is collected at the ghat
    return {
        v: 1,
        kind: "boat",
        key: q.id,
        created_at: new Date(Number(payment?.created_at ?? order?.created_at ?? Date.now() / 1000) * 1000).toISOString(),
        product: q.ride.packageId === "custom" ? "custom-boat" : q.ride.packageId,
        name: q.customer.name,
        customer_email: String(payment?.email || q.customer.email || "").toLowerCase() || null,
        phone: String(payment?.contact || q.customer.phone || ""),
        email: String(payment?.email || q.customer.email || ""),
        payment_mode: due ? "cod" : "online_domestic",
        payment_status: due ? "advance" : "paid",
        payment_ref: String(payment?.id ?? ""),
        amount: Number(payment?.amount ?? order?.amount ?? 0) / 100,
        credits_used: 0,
        coupon,
        notes: [`Quotation ${q.id}`, due ? `₹${due.toLocaleString("en-IN")} to collect at the ghat` : "", q.ride.dateLabel ? `Date: ${q.ride.dateLabel}` : "", choices].filter(Boolean).join(" · "),
        ghat: q.ride.ghat,
        ride_date: q.ride.dateLabel ? undefined : q.ride.date,
        time_of_day: `${q.ride.slot}, ${q.ride.startTime}`,
        guests: Number(order?.notes?.pax) || paxFromChoices(choices),
    };
}

// Paid quotations straight from Razorpay — the source of truth, so nothing paid is ever missing from the admin list.
export async function listPaidQuoteRecords(getQuote: (id: string) => Promise<Quote | null>): Promise<OrderRecord[]> {
    if (!process.env.RAZORPAY_KEY_SECRET) return [];
    const rz = razorpay();
    const paid: any[] = [];
    for (let skip = 0; skip < 500; skip += 100) {
        const page: any = await rz.orders.all({ count: 100, skip } as any);
        const items: any[] = page?.items ?? [];
        paid.push(...items.filter((o) => o.status === "paid" && String(o.receipt ?? "").startsWith("quote_")));
        if (items.length < 100) break;
    }
    const records = await Promise.all(paid.map(async (o) => {
        const q = await getQuote(String(o.notes?.quote ?? ""));
        if (!q) return null;
        const pays: any = await rz.orders.fetchPayments(o.id);
        const p = (pays?.items ?? []).find((x: any) => x.status === "captured") ?? (pays?.items ?? [])[0];
        return quoteOrderRecord(q, o, p);
    }));
    return records.filter((r): r is OrderRecord => r !== null);
}
