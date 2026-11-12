import { NextResponse } from "next/server";
import crypto from "crypto";
import { createDdOrder, ddRecord, priceBooking } from "@/lib/devDeepawaliOrders";
import { razorpay as rz } from "@/lib/quotePayments";
import { orderMailParts, syncOrdersToDb, type OrderRecord } from "@/lib/orderMail";
import { createTransporter, simpleEmail } from "@/lib/mailer";
import { rateLimited } from "@/lib/rateLimit";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

async function notify(order: any, payment: any, record: OrderRecord) {
    const owner = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
    if (!owner) return;
    const n = order?.notes ?? {};
    const due = Number(n.due) || 0;
    const paid = inr(Number(payment.amount) / 100);
    const t = createTransporter();
    try {
        await t.sendMail({
            from: `"KashiGo Bookings" <${owner}>`,
            to: owner,
            subject: `Dev Deepawali ${due ? "50% advance" : "paid"}: ${n.booking} — ${n.name} — ${n.people} seat${n.people === "1" ? "" : "s"} — ${paid}${due ? ` (+ ${inr(due)} at the ghat)` : ""}`,
            // The order attachment puts this booking in /admin → Orders as well.
            ...orderMailParts(record),
            text: [
                `Booking: ${n.booking}`,
                `Dev Deepawali shared boat · Tue 24 Nov 2026`,
                `Seats: ${n.people} · total ${inr(Number(n.total))} (seat price ${inr(Number(n.per))}${Number(n.people) >= 3 ? ", Trio pack" : ""})`,
                `Passengers: ${[n.name, n.passengers].filter(Boolean).join(", ")}`,
                `Phone: ${n.phone} · Email: ${n.email}`,
                `Paid: ${paid} via ${payment.method}${due ? " (50% advance)" : ""}`,
                ...(due ? [`TO COLLECT AT THE GHAT: ${inr(due)}`] : []),
                `Payment ID: ${payment.id}`,
                "",
                "→ Call the customer to confirm the boarding ghat and time.",
            ].join("\n"),
        });
    } catch (e) {
        console.error("Dev Deepawali owner mail failed:", e);
    }
    const to = n.email || payment.email;
    if (!to) return;
    try {
        await t.sendMail({
            from: `"KashiGo" <${owner}>`,
            to,
            subject: `Booked: Dev Deepawali on the Ganga — ${n.people} seat${n.people === "1" ? "" : "s"} (${n.booking})`,
            html: simpleEmail({
                preheader: `${due ? "Advance" : "Payment"} of ${paid} received. We'll call you with your boarding ghat and time.`,
                heading: `You're going to Dev Deepawali, ${String(n.name).split(" ")[0]}!`,
                paragraphs: [
                    `We've received <b>${paid}</b> for <b>${n.people} seat${n.people === "1" ? "" : "s"}</b> on our boat for Dev Deepawali, <b>Tuesday 24 November 2026</b>. Booking ${n.booking} · Payment ID ${payment.id}.`,
                    `Passengers: ${[n.name, n.passengers].filter(Boolean).join(", ").replace(/[<>&]/g, "")}.`,
                    due
                        ? `You've paid a 50% advance. Please pay the remaining <b>${inr(due)}</b> to your KashiGo boatman at the ghat (cash or UPI) — <b>nobody else</b>, and nothing beyond ${inr(due)}.`
                        : `Your seats are fully paid. <b>Please don't pay any cash</b> to the boatman or anyone else at the ghat.`,
                    `We'll call you on ${String(n.phone).replace(/[<>&]/g, "")} to confirm your boarding ghat and reporting time. Keep your life jacket on for the whole ride.`,
                    `Need us? Call or WhatsApp <a href="tel:+918175966910">+91 81759 66910</a>. Har Har Mahadev.`,
                ],
                links: [{ label: "Dev Deepawali page", url: "https://kashigo.in/dev-deepawali" }],
            }),
        });
    } catch (e) {
        console.error("Dev Deepawali customer mail failed:", e);
    }
}

export async function POST(req: Request) {
    if (rateLimited(req, "dev-deepawali", 20, 60 * 1000)) return NextResponse.json({ success: false, message: "Too many attempts — please wait a minute." }, { status: 429 });
    try {
        const body = await req.json();

        if (body?.action === "order") {
            // Priced here from today's date and the number of seats — the amount the browser shows is never used.
            const priced = priceBooking(body);
            if ("problem" in priced) return NextResponse.json({ success: false, message: priced.problem }, { status: 400 });
            const b = priced.booking;
            const order = await createDdOrder(b);
            return NextResponse.json({ success: true, orderId: order.id, amount: order.amount, keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, booking: b.id, onlineInr: b.onlineInr, dueInr: b.dueInr, totalInr: b.totalInr });
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
            if (order?.notes?.kind !== "dev-deepawali" || Number(payment?.amount) !== Number(order?.amount)) {
                return NextResponse.json({ success: false, message: "This payment doesn't match a Dev Deepawali booking." }, { status: 400 });
            }
            const record = ddRecord(order, payment);
            await Promise.all([
                notify(order, payment, record),
                syncOrdersToDb([record]).then((r) => r.error && console.error("Dev Deepawali booking not saved to the database:", r.error)),
            ]);
            return NextResponse.json({ success: true, booking: record.key, paymentId });
        }

        return NextResponse.json({ success: false, message: "Unknown action." }, { status: 400 });
    } catch (error: any) {
        console.error("Dev Deepawali payment error:", error);
        return NextResponse.json({ success: false, message: error?.error?.description || error?.message || "Payment could not be started." }, { status: 500 });
    }
}
