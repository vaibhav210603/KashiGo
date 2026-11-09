import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { prepareCheckout } from "@/lib/checkout";
import { DEV_DEEPAWALI_CLOSED, DEV_DEEPAWALI_DAY, noticeFor, rideStartMinutes } from "@/lib/boatRides";
import { isBoatProduct, isPlanCode } from "@/lib/pricing";

const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
    try {
        const { product, coupon, useCredits, advance, guests, rideDate, customTime } = await req.json();
        if (isBoatProduct(String(product)) && rideDate === DEV_DEEPAWALI_DAY) return NextResponse.json({ success: false, message: DEV_DEEPAWALI_CLOSED }, { status: 400 });
        // Boat rides booked for today or tomorrow carry the short-notice surcharge (ignored for everything else).
        const notice = noticeFor(String(rideDate ?? ""), rideStartMinutes(String(product), String(customTime ?? "")));
        // Pay-at-the-ghat bookings pay a 50% advance online; coins and most codes don't apply to them —
        // only codes made for 50/50 payment (WELCOME10). Codes made for full payment (WELCOME20) are refused by prepareCheckout.
        const isAdvance = advance === true;
        const code = isAdvance && !isPlanCode(coupon, "advance50") && !isPlanCode(coupon, "full") ? null : coupon;

        // Price is resolved server-side from the product id, the coupon and the buyer's coins. Client-sent amounts are ignored.
        const prep = await prepareCheckout(req, { product: String(product), coupon: code, useCredits: isAdvance ? false : Boolean(useCredits), provider: "razorpay", plan: isAdvance ? "advance50" : "full", guests: Number(guests) || undefined, noticePct: notice.pct });
        const payInr = isAdvance ? Math.ceil(prep.ok ? prep.payInr / 2 : 0) : prep.ok ? prep.payInr : 0;
        if (!prep.ok) return NextResponse.json({ success: false, message: prep.message }, { status: prep.status });

        // Razorpay expects amount in paise (INR * 100)
        const order = await razorpay.orders.create({
            amount: Math.round(payInr * 100),
            currency: "INR",
            receipt: `kashigo_${Date.now()}`,
            // Stamped server-side so payment checks can confirm what this order was for.
            notes: { product: String(product), coupon: prep.rule?.code ?? "", credits: String(prep.creditsInr), email: prep.email ?? "", guests: String(Number(guests) || ""), ride_date: String(rideDate ?? "").slice(0, 10), notice: String(notice.pct), ...(isAdvance ? { advance: "50", full: String(prep.payInr) } : {}) },
        });

        const problem = await prep.commit(`razorpay:${order.id}`);
        if (problem) return NextResponse.json({ success: false, message: problem }, { status: 409 });

        return NextResponse.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            credits: prep.creditsInr,
            keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        });
    } catch (error: any) {
        console.error("Razorpay Order Creation Error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to create payment order" },
            { status: 500 }
        );
    }
}
