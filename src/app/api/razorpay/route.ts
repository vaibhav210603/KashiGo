import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getAmountINR } from "@/lib/pricing";

const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
    try {
        const { product, coupon } = await req.json();

        // Price is resolved server-side from the product id. Client-sent amounts are ignored.
        const amount = getAmountINR(product, coupon);

        if (amount === null || amount <= 0) {
            return NextResponse.json(
                { success: false, message: "Invalid product" },
                { status: 400 }
            );
        }

        // Razorpay expects amount in paise (INR * 100)
        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100),
            currency: "INR",
            receipt: `kashigo_${Date.now()}`,
        });

        return NextResponse.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
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
