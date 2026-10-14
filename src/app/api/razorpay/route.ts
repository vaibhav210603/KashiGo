import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getAmountINR } from "@/lib/pricing";
import { guardCoupon } from "@/lib/couponLimits";

const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
    try {
        const { product, coupon } = await req.json();

        // Price is resolved server-side from the product id. Client-sent amounts are ignored.
        const base = getAmountINR(product);
        let amount = getAmountINR(product, coupon);

        if (base === null || amount === null || amount <= 0) {
            return NextResponse.json(
                { success: false, message: "Invalid product" },
                { status: 400 }
            );
        }

        const discounted = amount < base;
        const guard = discounted ? await guardCoupon(req, coupon) : null;
        if (guard && !guard.ok) {
            return NextResponse.json({ success: false, message: guard.message }, { status: 409 });
        }
        if (!discounted) amount = base;

        // Razorpay expects amount in paise (INR * 100)
        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100),
            currency: "INR",
            receipt: `kashigo_${Date.now()}`,
            // Stamped server-side so payment checks can confirm what this order was for.
            notes: { product: String(product), coupon: discounted ? String(coupon).trim().toUpperCase() : "" },
        });

        const res = NextResponse.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        });
        if (guard && !(await guard.commit(res, `razorpay:${order.id}`))) {
            return NextResponse.json({ success: false, message: "This code has already been used." }, { status: 409 });
        }
        return res;
    } catch (error: any) {
        console.error("Razorpay Order Creation Error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to create payment order" },
            { status: 500 }
        );
    }
}
