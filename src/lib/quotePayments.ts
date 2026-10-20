// Server-only Razorpay helpers for quotation pages.
import Razorpay from "razorpay";
import { quoteReceipt, type Quote } from "@/lib/quotes";

export const razorpay = () => new Razorpay({ key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!, key_secret: process.env.RAZORPAY_KEY_SECRET! });

export type PaidOrder = { amountInr: number; choices: string };

// The paid Razorpay order for this quote, if any — the page shows "Paid" and the API refuses a second charge.
export async function paidQuoteOrder(q: Quote): Promise<PaidOrder | null> {
    if (!process.env.RAZORPAY_KEY_SECRET) return null;
    try {
        const list: any = await razorpay().orders.all({ receipt: quoteReceipt(q) } as any);
        const o = (list?.items ?? []).find((o: any) => o.status === "paid");
        return o ? { amountInr: Number(o.amount) / 100, choices: String(o.notes?.choices ?? "") } : null;
    } catch {
        return null;
    }
}

export const isQuotePaid = async (q: Quote) => (await paidQuoteOrder(q)) !== null;
