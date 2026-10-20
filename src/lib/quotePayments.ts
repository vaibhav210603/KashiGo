// Server-only Razorpay helpers for quotation pages.
import Razorpay from "razorpay";
import { quoteReceipt, type Quote } from "@/lib/quotes";

export const razorpay = () => new Razorpay({ key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!, key_secret: process.env.RAZORPAY_KEY_SECRET! });

// Whether this quote already has a paid Razorpay order — the page shows "Paid" and the API refuses a second charge.
export async function isQuotePaid(q: Quote): Promise<boolean> {
    if (!process.env.RAZORPAY_KEY_SECRET) return false;
    try {
        const list: any = await razorpay().orders.all({ receipt: quoteReceipt(q) } as any);
        return (list?.items ?? []).some((o: any) => o.status === "paid");
    } catch {
        return false;
    }
}
