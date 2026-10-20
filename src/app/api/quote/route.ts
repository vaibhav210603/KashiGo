import { NextResponse } from "next/server";
import crypto from "crypto";
import { getQuote, quoteReceipt, quoteTotal, type Quote } from "@/lib/quotes";
import { isQuotePaid, razorpay as rz } from "@/lib/quotePayments";
import { createTransporter, simpleEmail } from "@/lib/mailer";
import { rateLimited } from "@/lib/rateLimit";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const longDate = (iso: string) => new Date(`${iso}T00:00:00+05:30`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });

async function notify(q: Quote, payment: any) {
    const owner = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
    if (!owner) return;
    const total = inr(quoteTotal(q));
    const t = createTransporter();
    try {
        await t.sendMail({
            from: `"KashiGo Quotes" <${owner}>`,
            to: owner,
            subject: `Quote paid: ${q.id} — ${q.customer.name} — ${total}`,
            text: [
                `Quote: ${q.id}`,
                `Customer: ${q.customer.name}`,
                `Ride: ${q.ride.title}, ${q.ride.ghat}`,
                `Date: ${longDate(q.ride.date)} — report ${q.ride.reportTime}, Aarti ${q.ride.aartiTime}`,
                `Paid: ${inr(Number(payment.amount) / 100)} via ${payment.method}`,
                `Payment ID: ${payment.id}`,
                `Payer: ${payment.email || "—"} / ${payment.contact || "—"}`,
            ].join("\n"),
        });
    } catch (e) {
        console.error("Quote owner mail failed:", e);
    }
    if (!payment.email) return;
    try {
        await t.sendMail({
            from: `"KashiGo" <${owner}>`,
            to: payment.email,
            subject: `Confirmed: ${q.ride.title} on ${longDate(q.ride.date)}`,
            html: simpleEmail({
                preheader: `Payment of ${total} received. Please reach ${q.ride.ghat} by ${q.ride.reportTime} sharp.`,
                heading: `You're all set, ${q.customer.name.split(" ")[0]}!`,
                paragraphs: [
                    `We've received your payment of <b>${total}</b> for the <b>${q.ride.title}</b> (quotation ${q.id}). Payment ID: ${payment.id}.`,
                    `<b>${longDate(q.ride.date)}</b> — please reach <b>${q.ride.ghat}</b> by <b>${q.ride.reportTime} sharp</b>. The Aarti begins at ${q.ride.aartiTime}.`,
                    `Your ride is fully paid. <b>Please do not pay any cash</b> to the boatman or anyone else at the ghat. Keep your life jacket on for the whole ride.`,
                    `Need us? Call or WhatsApp <a href="tel:+918175966910">+91 81759 66910</a>. Have a safe and beautiful journey — Har Har Mahadev.`,
                ],
                links: [{ label: "View your quotation", url: `https://kashigo.in/quote/${q.id}` }],
            }),
        });
    } catch (e) {
        console.error("Quote customer mail failed:", e);
    }
}

export async function POST(req: Request) {
    if (rateLimited(req, "quote", 20, 60 * 1000)) return NextResponse.json({ success: false, message: "Too many attempts — please wait a minute." }, { status: 429 });
    try {
        const body = await req.json();
        const q = getQuote(String(body?.id ?? ""));
        if (!q) return NextResponse.json({ success: false, message: "Quotation not found." }, { status: 404 });
        const total = quoteTotal(q);

        if (body.action === "order") {
            if (await isQuotePaid(q)) return NextResponse.json({ success: false, message: "This quotation is already paid." }, { status: 409 });
            const order = await rz().orders.create({
                amount: total * 100,
                currency: "INR",
                receipt: quoteReceipt(q),
                notes: { quote: q.id, customer: q.customer.name, ride: `${q.ride.title} · ${q.ride.date}` },
            });
            return NextResponse.json({ success: true, orderId: order.id, amount: order.amount, keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID });
        }

        if (body.action === "verify") {
            const orderId = String(body.razorpay_order_id ?? "");
            const paymentId = String(body.razorpay_payment_id ?? "");
            const signature = String(body.razorpay_signature ?? "");
            const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "").update(`${orderId}|${paymentId}`).digest("hex");
            if (expected.length !== signature.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
                return NextResponse.json({ success: false, message: "We couldn't verify this payment." }, { status: 400 });
            }
            const [order, payment]: any[] = await Promise.all([rz().orders.fetch(orderId), rz().payments.fetch(paymentId)]);
            if (order?.notes?.quote !== q.id || Number(order?.amount) !== total * 100) {
                return NextResponse.json({ success: false, message: "This payment doesn't match the quotation." }, { status: 400 });
            }
            await notify(q, payment);
            return NextResponse.json({ success: true, paymentId });
        }

        return NextResponse.json({ success: false, message: "Unknown action." }, { status: 400 });
    } catch (error: any) {
        console.error("Quote payment error:", error);
        return NextResponse.json({ success: false, message: error?.error?.description || error?.message || "Payment could not be started." }, { status: 500 });
    }
}
