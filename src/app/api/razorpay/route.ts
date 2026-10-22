import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { prepareCheckout } from "@/lib/checkout";

const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
    try {
        const { product, coupon, useCredits, advance } = await req.json();
        // Pay-at-the-ghat bookings pay a 50% advance online; codes and coins don't apply to them.
        const isAdvance = advance === true;

        // Price is resolved server-side from the product id, the coupon and the buyer's coins. Client-sent amounts are ignored.
        const prep = await prepareCheckout(req, { product: String(product), coupon: isAdvance ? null : coupon, useCredits: isAdvance ? false : Boolean(useCredits), provider: "razorpay" });
        const payInr = isAdvance ? Math.ceil(prep.ok ? prep.payInr / 2 : 0) : prep.ok ? prep.payInr : 0;
        if (!prep.ok) return NextResponse.json({ success: false, message: prep.message }, { status: prep.status });

        // Razorpay expects amount in paise (INR * 100)
        const order = await razorpay.orders.create({
            amount: Math.round(payInr * 100),
            currency: "INR",
            receipt: `kashigo_${Date.now()}`,
            // Stamped server-side so payment checks can confirm what this order was for.
            notes: { product: String(product), coupon: prep.rule?.code ?? "", credits: String(prep.creditsInr), email: prep.email ?? "", ...(isAdvance ? { advance: "50", full: String(prep.payInr) } : {}) },
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
