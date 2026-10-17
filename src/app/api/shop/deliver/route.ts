import { NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { getDownloads } from "@/lib/downloads";
import { isShopProduct, priceOf } from "@/lib/pricing";
import { INR_PER_USD } from "@/lib/boatPrices";
import { getRule } from "@/lib/coupons";
import { getSession } from "@/lib/auth";
import { finalize, prepareCheckout, refInfo, saveProfile } from "@/lib/checkout";
import { normalizePhone } from "@/lib/phone";
import { hasServiceRole, supabaseAdmin } from "@/lib/supabaseAdmin";
import { orderMailParts, shopRow, type OrderRecord } from "@/lib/orderMail";
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

        const session = await getSession(req);
        const customerPhone = session?.phone ?? normalizePhone(body.phone);

        let ok = false;
        let reference = "";
        let ref = ""; // the checkout ref any coupon / coins were held under
        if (provider === "razorpay") {
            ok = await verifyRazorpay(product, body.razorpay_order_id, body.razorpay_payment_id, body.razorpay_signature);
            reference = body.razorpay_payment_id;
            ref = `razorpay:${body.razorpay_order_id}`;
        } else if (provider === "paypal") {
            ok = await verifyPayPal(product, body.paypalOrderId);
            reference = body.paypalOrderId;
            ref = `paypal:${body.paypalOrderId}`;
        } else if (provider === "credits") {
            // Paid entirely in KashiGo coins — nothing charged yet, so a problem here can still refuse.
            const prep = await prepareCheckout(req, { product, coupon: body.coupon, provider: "credits" });
            if (!prep.ok) return NextResponse.json({ success: false, message: prep.message }, { status: prep.status });
            ref = `credits:shop-${crypto.randomUUID()}`;
            const problem = await prep.commit(ref);
            if (problem) return NextResponse.json({ success: false, message: problem }, { status: 409 });
            ok = true;
            reference = ref;
        }
        if (!ok) {
            if (!rateLimited(req, "shop-alert", 5, 60 * 60 * 1000)) await alertOwner(`⚠️ Shop order needs manual delivery: ${product}`, body, "Payment could not be verified automatically — check the provider dashboard, then email the files.");
            return NextResponse.json({ success: false, pending: true }, { status: 202 });
        }

        await finalize(ref);
        await saveProfile(customerPhone, name, email);
        const rec = await shopRecord({ ref, product, provider, customerPhone, name, email, phone: body.phone, coupon: body.coupon });
        await recordShopOrder(rec);
        await notifyShopSale(rec);

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

// The purchase as data: saved to shop_orders and attached to the owner email (lib/orderMail.ts).
async function shopRecord(o: { ref: string; product: string; provider: string; customerPhone: string | null; name?: string; email?: string; phone?: string; coupon?: string }): Promise<OrderRecord> {
    const held = await refInfo(o.ref);
    const coupon = held.coupon ?? (o.provider === "credits" ? String(o.coupon || "").toUpperCase() || null : null);
    const price = priceOf(o.product, await getRule(coupon))!;
    return {
        v: 1, kind: "shop", key: o.ref, created_at: new Date().toISOString(), product: o.product,
        name: String(o.name || "").slice(0, 80), customer_phone: o.customerPhone, phone: String(o.phone || "").slice(0, 20),
        email: String(o.email || "").slice(0, 120), payment_mode: o.provider, payment_status: "paid", payment_ref: o.ref,
        amount: Math.max(0, price.inr - held.creditsInr),
        amount_usd: o.provider === "paypal" ? Math.max(0.01, Number((price.usd - held.creditsInr / INR_PER_USD).toFixed(2))) : null,
        credits_used: held.creditsInr, coupon, notes: "",
    };
}

// Every paid purchase is kept with the buyer's phone, so it shows in /admin and can be refunded as coins.
async function recordShopOrder(rec: OrderRecord) {
    if (!hasServiceRole()) return;
    try {
        const { error } = await supabaseAdmin().from("shop_orders").upsert(shopRow(rec), { onConflict: "order_ref", ignoreDuplicates: true });
        if (error) console.error("Shop order save failed:", error);
    } catch (e) {
        console.error("Shop order save failed:", e);
    }
}

// One email to the owner per sale — also how /admin lists purchases when the database is unavailable.
async function notifyShopSale(rec: OrderRecord) {
    const to = process.env.SMTP_USER;
    if (!to) return;
    const meta = SHOP_PRODUCTS.find((p) => p.id === rec.product);
    try {
        await createTransporter().sendMail({
            from: `"KashiGo Shop" <${to}>`,
            to,
            subject: `New sale · ${meta?.name ?? rec.product} · ₹${rec.amount}${rec.credits_used ? ` + ${rec.credits_used} coins` : ""}`,
            text: [
                `Product: ${meta?.name ?? rec.product}`, `Buyer: ${rec.name} <${rec.email}>`, `Phone: ${rec.customer_phone || rec.phone || "—"}`,
                `Paid: ₹${rec.amount}${rec.amount_usd ? ` ($${rec.amount_usd})` : ""} via ${rec.payment_mode}`, `Coins used: ${rec.credits_used}`,
                `Code: ${rec.coupon || "—"}`, `Order ref: ${rec.key}`,
            ].join("\n"),
            ...orderMailParts(rec),
        });
    } catch (e) {
        console.error("Shop sale email failed:", e);
    }
}
