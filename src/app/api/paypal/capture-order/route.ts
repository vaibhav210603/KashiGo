import { NextResponse } from "next/server";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;
const base = "https://api-m.sandbox.paypal.com";

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
        const { orderId } = await req.json();

        if (!orderId) {
            return NextResponse.json({ success: false, message: "Invalid order ID" }, { status: 400 });
        }

        const accessToken = await generateAccessToken();
        const url = `${base}/v2/checkout/orders/${orderId}/capture`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const captureData = await response.json();

        if (captureData.status === "COMPLETED") {
            return NextResponse.json({ success: true, captureData });
        } else {
            console.error("PayPal Capture Error:", captureData);
            return NextResponse.json({ success: false, message: "Failed to capture PayPal payment" }, { status: 500 });
        }
    } catch (error: any) {
        console.error("PayPal Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
