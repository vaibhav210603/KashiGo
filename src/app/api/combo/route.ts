import { NextResponse } from "next/server";
import crypto from "crypto";
import { comboNotes, comboRideRecord, createComboOrder, priceCombo } from "@/lib/comboOrders";
import { razorpay as rz } from "@/lib/quotePayments";
import { orderMailParts, syncOrdersToDb } from "@/lib/orderMail";
import { createTransporter, simpleEmail } from "@/lib/mailer";
import { rateLimited } from "@/lib/rateLimit";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const esc = (s: string) => s.replace(/[<>&]/g, "");
const day = (iso: string) => (iso ? new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }) : "");

async function notify(order: any, payment: any) {
    const owner = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
    if (!owner) return;
    const c = comboNotes(order);
    const paid = inr(Number(payment.amount) / 100);
    const combo = c.plan === "combo";
    const meet = `${c.minutes}-min Google Meet with ${c.expertName} · ${day(c.meetDate)} at ${c.meetLabel} (India time)`;
    const ride = combo ? `${c.rideName} · ${day(c.rideDate)} · ${c.rideTime} · from ${c.ghat} · ${c.guests} ${c.guests === 1 ? "person" : "people"}` : "";
    const record = comboRideRecord(order, payment);
    const t = createTransporter();
    try {
        await t.sendMail({
            from: `"KashiGo Bookings" <${owner}>`,
            to: owner,
            replyTo: c.email || undefined,
            subject: `${combo ? "Ride + consultation" : "Consultation"} paid: ${c.booking} — ${c.name} — ${paid}`,
            // For the combo, the order attachment puts the boat ride in /admin → Orders as well.
            ...(record ? orderMailParts(record) : {}),
            text: [
                `Booking: ${c.booking} (${combo ? "boat ride + consultation" : "consultation only"})`,
                ...(combo ? [`Ride: ${ride}`] : []),
                `Consultation: ${meet}`,
                `Free 5-min call first: call the customer to hear the question and confirm the slot.`,
                `Wants to ask about: ${c.concerns.join(", ")}`,
                `Birth: ${c.dob || "date not given"} · ${c.birthTime || "time not given"} · ${c.birthPlace || "place not given"}`,
                `Phone: ${c.phone} · Email: ${c.email}`,
                `Paid: ${paid} via ${payment.method} · Payment ID: ${payment.id}`,
                "",
                "→ Send the Google Meet link to the customer by email and WhatsApp before the slot.",
            ].join("\n"),
        });
    } catch (e) {
        console.error("Combo owner mail failed:", e);
    }
    const to = c.email || payment.email;
    if (!to) return;
    try {
        await t.sendMail({
            from: `"KashiGo" <${owner}>`,
            to,
            subject: `Booked: ${combo ? "your boat ride + " : "your "}Google Meet with ${c.expertName} (${c.booking})`,
            html: simpleEmail({
                preheader: `Payment of ${paid} received. We'll call you first, then send your Google Meet link.`,
                heading: `Thank you, ${esc(c.name.split(" ")[0])}`,
                paragraphs: [
                    `We've received <b>${paid}</b>. Booking ${c.booking} · Payment ID ${payment.id}.`,
                    ...(combo ? [`<b>Your boat ride:</b> ${esc(ride)}. Your boat is paid in full — <b>please don't pay any cash</b> to the boatman or anyone else at the ghat.`] : []),
                    `<b>Your consultation:</b> ${esc(meet)}. You asked about: ${esc(c.concerns.join(", "))}.`,
                    `First, we'll call you on <b>${esc(c.phone)}</b> for a free 5-minute chat, so your guru knows your question before you meet. Your Google Meet link comes by email and WhatsApp before your slot — open it on your phone or laptop.`,
                    `Need us? Call or WhatsApp <a href="tel:+918175966910">+91 81759 66910</a>.`,
                ],
            }),
        });
    } catch (e) {
        console.error("Combo customer mail failed:", e);
    }
    if (record) await syncOrdersToDb([record]).then((r) => r.error && console.error("Combo ride not saved to the database:", r.error));
}

export async function POST(req: Request) {
    if (rateLimited(req, "combo", 20, 60 * 1000)) return NextResponse.json({ success: false, message: "Too many attempts — please wait a minute." }, { status: 429 });
    try {
        const body = await req.json();

        if (body?.action === "order") {
            // Priced here — the amount the browser shows is never used.
            const priced = priceCombo(body);
            if ("problem" in priced) return NextResponse.json({ success: false, message: priced.problem }, { status: 400 });
            const b = priced.booking;
            const order = await createComboOrder(b);
            return NextResponse.json({ success: true, orderId: order.id, amount: order.amount, keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, booking: b.id, totalInr: b.totalInr });
        }

        if (body?.action === "verify") {
            const orderId = String(body.razorpay_order_id ?? "");
            const paymentId = String(body.razorpay_payment_id ?? "");
            const signature = String(body.razorpay_signature ?? "");
            const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "").update(`${orderId}|${paymentId}`).digest("hex");
            if (expected.length !== signature.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
                return NextResponse.json({ success: false, message: "We couldn't verify this payment." }, { status: 400 });
            }
            const [order, payment]: any[] = await Promise.all([rz().orders.fetch(orderId), rz().payments.fetch(paymentId)]);
            // Orders are only ever created (and priced) by this route, so our notes on the order are enough.
            if (order?.notes?.kind !== "ride-consult" || Number(payment?.amount) !== Number(order?.amount)) {
                return NextResponse.json({ success: false, message: "This payment doesn't match a KashiGo booking." }, { status: 400 });
            }
            await notify(order, payment);
            return NextResponse.json({ success: true, booking: order.notes.booking, paymentId });
        }

        return NextResponse.json({ success: false, message: "Unknown action." }, { status: 400 });
    } catch (error: any) {
        console.error("Combo payment error:", error);
        return NextResponse.json({ success: false, message: error?.error?.description || error?.message || "Payment could not be started." }, { status: 500 });
    }
}
