import { NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { getDownloads } from "@/lib/downloads";
import { isShopProduct } from "@/lib/pricing";
import { createTransporter, simpleEmail } from "@/lib/mailer";
import { SHOP_PRODUCTS } from "@/lib/products";
import { rateLimited } from "@/lib/rateLimit";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;
const paypalBase = process.env.NODE_ENV === "production" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

async function verifyRazorpay(product: string, orderId: string, paymentId: string, signature: string) {
    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    const expected = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
    if (!signature || expected.length !== signature.length) return false;
    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return false;
    // The product is stamped on the order server-side when it is created.
    const rz = new Razorpay({ key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!, key_secret: secret });
    const order: any = await rz.orders.fetch(orderId);
    return order?.notes?.product === product;
}

async function verifyPayPal(product: string, orderId: string) {
    const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET).toString("base64");
    const tok = await fetch(`${paypalBase}/v1/oauth2/token`, {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    }).then((r) => r.json());
    const order = await fetch(`${paypalBase}/v2/checkout/orders/${encodeURIComponent(orderId)}`, {
        headers: { Authorization: `Bearer ${tok.access_token}` },
    }).then((r) => r.json());
    return order?.status === "COMPLETED" && order?.purchase_units?.[0]?.custom_id === product;
}

// The buyer never sees a failure after paying; the owner gets what's needed to send the files by hand.
async function alertOwner(subject: string, body: Record<string, unknown>, note: string) {
    const to = process.env.SMTP_USER;
    if (!to) return;
    const { product, provider, email, name, razorpay_payment_id, paypalOrderId } = body as any;
    try {
        await createTransporter().sendMail({
            from: `"KashiGo Shop" <${to}>`,
            to,
            subject,
            text: [`Note: ${note}`, `Product: ${product}`, `Buyer: ${name || ""} <${email || ""}>`, `Provider: ${provider}`, `Payment ref: ${razorpay_payment_id || paypalOrderId || "—"}`].join("\n"),
        });
    } catch (e) {
        console.error("Owner alert failed:", e);
    }
}

export async function POST(req: Request) {
    let body: any = {};
    try {
        body = await req.json();
        const { product, provider, email, name } = body;

        if (!isShopProduct(product)) {
            return NextResponse.json({ success: false, message: "Unknown product" }, { status: 400 });
        }

        let ok = false;
        let reference = "";
        if (provider === "razorpay") {
            ok = await verifyRazorpay(product, body.razorpay_order_id, body.razorpay_payment_id, body.razorpay_signature);
            reference = body.razorpay_payment_id;
        } else if (provider === "paypal") {
            ok = await verifyPayPal(product, body.paypalOrderId);
            reference = body.paypalOrderId;
        }
        if (!ok) {
            if (!rateLimited(req, "shop-alert", 5, 60 * 60 * 1000)) await alertOwner(`⚠️ Shop order needs manual delivery: ${product}`, body, "Payment could not be verified automatically — check the provider dashboard, then email the files.");
            return NextResponse.json({ success: false, pending: true }, { status: 202 });
        }

        const origin = new URL(req.url).origin.includes("localhost") ? new URL(req.url).origin : "https://kashigo.in";
        const downloads = getDownloads(product, origin)!;
        const meta = SHOP_PRODUCTS.find((p) => p.id === product)!;

        if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            try {
                await createTransporter().sendMail({
                    from: `"Vaibhav from KashiGo" <${process.env.SMTP_USER}>`,
                    to: email,
                    replyTo: process.env.SMTP_USER,
                    subject: `Your download: ${meta.name}`,
                    html: simpleEmail({
                        preheader: "Your files are ready — links inside.",
                        heading: `Thank you${name ? ", " + String(name).split(" ")[0] : ""} — your files are ready`,
                        paragraphs: [
                            `Here's everything in <strong>${meta.name}</strong>. Save the files to your phone before you travel so they work offline.`,
                            "Ebooks: the PDF opens anywhere; the EPUB is for Kindle (send it via Send to Kindle) or Apple Books. Audio: unzip on a computer, or open the ZIP in the Files app on your phone.",
                        ],
                        links: downloads,
                        footer: `Payment reference: ${reference}. Questions, a broken link or want a refund? Just reply — I read every email.`,
                    }),
                });
            } catch (e) {
                console.error("Shop delivery email failed:", e);
            }
        }

        return NextResponse.json({ success: true, downloads });
    } catch (error: any) {
        console.error("Shop deliver error:", error);
        if (!rateLimited(req, "shop-alert", 5, 60 * 60 * 1000)) await alertOwner(`⚠️ Shop order needs manual delivery: ${body?.product}`, body, error?.message || "Delivery error");
        return NextResponse.json({ success: false, pending: true }, { status: 202 });
    }
}
