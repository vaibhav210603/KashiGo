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
        const { amount } = await req.json();

        if (!amount || amount <= 0) {
            return NextResponse.json({ success: false, message: "Invalid amount" }, { status: 400 });
        }

        // Convert INR to USD (approximate rate: 1 USD = 83 INR for demonstration, since PayPal sandbox doesn't support INR well without workarounds for Indian accounts in test mode, we convert to USD for international payments)
        const exchangeRate = 83;
        const amountInUSD = (amount / exchangeRate).toFixed(2);

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
