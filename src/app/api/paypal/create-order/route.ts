import { NextResponse } from "next/server";
import { getAmountUSD } from "@/lib/pricing";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;
const environment = process.env.NODE_ENV || "development";
const base = environment === "production" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

async function generateAccessToken() {
    const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET).toString("base64");
    const response = await fetch(`${base}/v1/oauth2/token`, {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
    const data = await response.json();
    return data.access_token;
}

export async function POST(req: Request) {
    try {
        const { product, coupon } = await req.json();

        // Price is resolved server-side from the product id. Client-sent amounts are ignored.
        const amountUSD = getAmountUSD(product, coupon);

        if (amountUSD === null || amountUSD <= 0) {
            return NextResponse.json({ success: false, message: "Invalid product" }, { status: 400 });
        }

        const amountInUSD = amountUSD.toFixed(2);

        const accessToken = await generateAccessToken();
        const url = `${base}/v2/checkout/orders`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                intent: "CAPTURE",
                purchase_units: [
                    {
                        amount: {
                            currency_code: "USD",
                            value: amountInUSD,
                        },
                    },
                ],
            }),
        });

        const orderData = await response.json();

        if (orderData.id) {
            return NextResponse.json({ success: true, orderId: orderData.id });
        } else {
            console.error("PayPal Order Creation Error:", orderData);
            return NextResponse.json({ success: false, message: "Failed to create PayPal order" }, { status: 500 });
        }
    } catch (error: any) {
        console.error("PayPal Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
