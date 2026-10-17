import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import Razorpay from "razorpay";
import { createTransporter } from "@/lib/mailer";
import { getBookingEmailTemplate } from "@/lib/emailTemplate";
import { priceOf } from "@/lib/pricing";
import { INR_PER_USD } from "@/lib/boatPrices";
import { getRule } from "@/lib/coupons";
import { getSession } from "@/lib/auth";
import { finalize, prepareCheckout, refInfo, saveProfile } from "@/lib/checkout";
import { normalizePhone } from "@/lib/phone";
import { orderMailParts, type OrderRecord } from "@/lib/orderMail";
import { BOAT_RIDES, CUSTOM_RIDE, GHATS, bookingTimeProblem, rideStartMinutes, toMinutes, inr } from "@/lib/boatRides";
import { rateLimited } from "@/lib/rateLimit";

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";
const paypalBase = process.env.NODE_ENV === "production" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

// amount = cash paid in rupees; credits = KashiGo coins used; ref = the checkout ref coins/coupon were held under.
type Verified = { status: "paid" | "pending" | "unverified"; amount: number; credits: number; ref: string; note?: string };

const PAY_MODES = ["cod", "online_domestic", "online_international", "credits"] as const;
type PayMode = (typeof PAY_MODES)[number];

// Plain text only: strips control characters and HTML-significant characters, caps the length.
const clean = (v: unknown, max = 100) => String(v ?? "").replace(/[\u0000-\u001f\u007f<>]/g, "").trim().slice(0, max);

type Booking = {
    product: string; // p1–p6 or custom-boat
    rideName: string;
    ghat: string;
    rideDate: string;
    startTime: string; // "5:30 AM" / "17:30"
    timeOfDay: string;
    custom: { time: string; tripType: "round" | "single"; destinationGhat: string } | null;
    name: string;
    phone: string;
    email: string;
    guests: number;
    paymentMode: PayMode;
    coupon: string;
    paymentRef: string;
};

// Rebuilds the booking from the request using only values we recognise; everything shown to
// the customer or the owner comes from here, never from raw client input.
function parseBooking(data: any): { booking: Booking; problems: string[] } {
    const problems: string[] = [];
    const isCustom = data?.experienceType === "custom";
    const ride = isCustom ? null : BOAT_RIDES.find((r) => r.id === data?.packageId);
    if (!isCustom && !ride) problems.push("Unknown ride.");

    const customTime = clean(data?.customDetails?.time, 5);
    const tripType = data?.customDetails?.tripType === "single" ? "single" : "round";
    const destinationGhat = tripType === "single" ? clean(data?.customDetails?.destinationGhat) : "";
    const ghat = clean(data?.ghat);
    if (!GHATS.includes(ghat)) problems.push("Unknown start ghat.");
    if (isCustom && Number.isNaN(toMinutes(customTime))) problems.push("Custom ride needs a valid start time.");
    if (isCustom && tripType === "single" && (!GHATS.includes(destinationGhat) || destinationGhat === ghat)) problems.push("Invalid drop-off ghat.");

    const product = isCustom ? "custom-boat" : ride?.id || "";
    const startTime = isCustom ? customTime : ride?.time || "";
    const rideDate = clean(data?.rideDate, 10);
    const timeProblem = bookingTimeProblem(rideDate, rideStartMinutes(product, customTime));
    if (timeProblem) problems.push(timeProblem);

    const p = data?.passengerDetails || {};
    const name = clean(p.name, 80);
    const phone = clean(p.phone, 20);
    const email = clean(p.email, 120);
    const guests = Math.trunc(Number(p.passengersCount));
    if (!name) problems.push("Missing passenger name.");
    if (phone.replace(/\D/g, "").length < 8) problems.push("Missing or invalid phone number.");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) problems.push("Invalid email address.");
    if (!(guests >= 1 && guests <= 20)) problems.push("Guests must be between 1 and 20.");

    const paymentMode: PayMode = PAY_MODES.includes(data?.paymentMode) ? data.paymentMode : "cod";
    const mins = toMinutes(startTime);
    const slot = mins < 11 * 60 ? "Morning" : mins < 17 * 60 ? "Afternoon" : "Evening";

    return {
        booking: {
            product,
            rideName: isCustom ? CUSTOM_RIDE.name : ride?.name || "",
            ghat,
            rideDate,
            startTime,
            timeOfDay: startTime ? `${slot}, ${startTime}` : "",
            custom: isCustom ? { time: customTime, tripType, destinationGhat } : null,
            name,
            phone,
            email: email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "",
            guests: guests >= 1 && guests <= 20 ? guests : 1,
            paymentMode,
            // Codes only apply to online payments; the payment routes enforce their limits.
            coupon: paymentMode === "cod" ? "" : clean(data?.coupon, 30).toUpperCase(),
            paymentRef: paymentMode === "cod" || paymentMode === "credits" ? "" : clean(data?.razorpayPaymentId, 64),
        },
        problems,
    };
}

// Confirms an online payment with the provider — that it went through, that it was for this
// ride, and that the full price was paid (after any coupon and coins) — so we never trust the client's word for it.
async function verifyPayment(b: Booking): Promise<Verified> {
    const list = priceOf(b.product)?.inr ?? 0;
    if (!b.paymentRef) return { status: "pending", amount: list, credits: 0, ref: "" }; // pay at the ghat

    try {
        if (b.paymentMode === "online_domestic") {
            const rz = new Razorpay({ key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!, key_secret: process.env.RAZORPAY_KEY_SECRET! });
            const p: any = await rz.payments.fetch(b.paymentRef);
            if (p?.status !== "captured" && p?.status !== "authorized") return { status: "unverified", amount: list, credits: 0, ref: "", note: `Razorpay payment status is "${p?.status}".` };
            const paid = Number(p.amount) / 100;
            const order: any = p.order_id ? await rz.orders.fetch(p.order_id) : null;
            const ref = p.order_id ? `razorpay:${p.order_id}` : "";
            const credits = Number(order?.notes?.credits || 0);
            const orderProduct = order?.notes?.product;
            if (orderProduct !== b.product) return { status: "unverified", amount: paid, credits, ref, note: `This payment was for "${orderProduct || "unknown"}", not ${b.product}.` };
            const expected = (priceOf(b.product, await getRule(order?.notes?.coupon))?.inr ?? Infinity) - credits;
            if (paid + 0.5 < expected) return { status: "unverified", amount: paid, credits, ref, note: `Paid ${inr(paid)} but the ride costs ${inr(expected)}.` };
            return { status: "paid", amount: paid, credits, ref };
        }
        if (b.paymentMode === "online_international") {
            const ref = `paypal:${b.paymentRef}`;
            const held = await refInfo(ref);
            const price = priceOf(b.product, await getRule(held.coupon ?? b.coupon));
            const listed = (price?.inr ?? list) - held.creditsInr;
            const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
            const tok = await fetch(`${paypalBase}/v1/oauth2/token`, {
                method: "POST",
                body: "grant_type=client_credentials",
                headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
            }).then((r) => r.json());
            // The booking screen sends the PayPal order id as the reference.
            const order = await fetch(`${paypalBase}/v2/checkout/orders/${encodeURIComponent(b.paymentRef)}`, {
                headers: { Authorization: `Bearer ${tok.access_token}` },
            }).then((r) => r.json());
            if (order?.status !== "COMPLETED") return { status: "unverified", amount: listed, credits: held.creditsInr, ref, note: `PayPal order status is "${order?.status}".` };
            const unit = order.purchase_units?.[0];
            if (unit?.custom_id !== b.product) return { status: "unverified", amount: listed, credits: held.creditsInr, ref, note: `This PayPal payment was for "${unit?.custom_id || "unknown"}", not ${b.product}.` };
            const paidUsd = Number(unit?.amount?.value);
            const expectedUsd = Math.max(0.01, (price?.usd ?? Infinity) - held.creditsInr / INR_PER_USD);
            if (!(paidUsd + 0.02 >= expectedUsd)) return { status: "unverified", amount: listed, credits: held.creditsInr, ref, note: `Paid $${paidUsd} but the ride costs $${expectedUsd.toFixed(2)}.` };
            return { status: "paid", amount: listed, credits: held.creditsInr, ref };
        }
    } catch (err) {
        console.error("Payment verification error:", err);
    }
    return { status: "unverified", amount: list, credits: 0, ref: "", note: "Payment could not be confirmed with the provider." };
}

// One email to the owner for every booking, with everything needed to run the ride.
// The order as data, attached to the owner email so the admin panel can read orders from the mailbox
// even when the database is unavailable (see lib/orderMail.ts).
function orderRecord(b: Booking, rideId: string, v: Verified, notes: string[], customerPhone: string | null): OrderRecord {
    return {
        v: 1, kind: "boat", key: rideId, created_at: new Date().toISOString(), product: b.product,
        name: b.name, customer_phone: customerPhone, phone: b.phone, email: b.email,
        payment_mode: b.paymentMode, payment_status: v.status, payment_ref: b.paymentRef, amount: v.amount,
        credits_used: v.credits, coupon: b.coupon || null, notes: notes.join(" | "),
        ghat: b.ghat, ride_date: b.rideDate, time_of_day: b.timeOfDay, guests: b.guests, custom: b.custom,
    };
}

// `record` is attached only for real bookings (not for "payment submitted twice" warnings).
async function notifyOwner(subject: string, b: Booking, rideId: string, v: Verified, notes: string[], record?: OrderRecord) {
    const to = process.env.SMTP_FROM_EMAIL;
    if (!to) return;
    const rows = [
        ["Ride ID", rideId],
        ...notes.map((n) => ["⚠️ Check", n]),
        ["Ride", b.rideName], ["Date", b.rideDate], ["Time", b.timeOfDay], ["From", b.ghat],
        ...(b.custom ? [["Trip", b.custom.tripType === "single" ? `One way to ${b.custom.destinationGhat}` : "Round trip"]] : []),
        ["Guests", b.guests], ["Name", b.name], ["Phone", b.phone], ["Email", b.email || "—"],
        ["Payment", `${v.status === "paid" ? (b.paymentMode === "credits" ? "PAID in KashiGo coins" : "PAID online") : v.status === "pending" ? "Pay at the ghat" : "UNVERIFIED"} · ${inr(v.amount)}`],
        ...(v.credits ? [["Coins used", inr(v.credits)]] : []),
        ["Payment mode", b.paymentMode], ["Payment ref", b.paymentRef || "—"], ["Code", b.coupon || "—"],
    ];
    try {
        await createTransporter().sendMail({
            from: `"KashiGo Bookings" <${to}>`,
            to,
            subject,
            text: rows.map(([k, val]) => `${k}: ${val ?? ""}`).join("\n"),
            ...(record ? orderMailParts(record) : {}),
        });
    } catch (err) {
        console.error("Owner email failed:", err);
    }
}

async function saveOrder(b: Booking, rideId: string, v: Verified, notes: string[], customerPhone: string | null) {
    const base = {
        ride_id: rideId,
        ghat: b.ghat,
        time_of_day: b.timeOfDay,
        boat_type: "Private",
        package_id: b.product === "custom-boat" ? "" : b.product,
        passenger_name: b.name,
        passenger_phone: b.phone,
        passenger_email: b.email,
        passengers_count: b.guests,
        amount: v.amount,
        payment_mode: b.paymentMode,
        payment_status: v.status,
        razorpay_payment_id: b.paymentRef || null,
    };
    const full = {
        ...base, ride_date: b.rideDate, custom_details: b.custom, coupon: b.coupon || null, check_notes: notes.join(" | ") || null,
        customer_phone: customerPhone, credits_used: v.credits,
    };
    let { error } = await supabase.from("orders").insert([full]);
    // Columns from supabase/orders_booking_fields.sql / accounts_credits_admin.sql not added yet: save what the table has,
    // with the date folded into the time so it is never lost.
    if (error && (error.code === "PGRST204" || error.code === "42703")) {
        ({ error } = await supabase.from("orders").insert([{ ...base, time_of_day: `${b.rideDate} · ${b.timeOfDay}` }]));
    }
    return error;
}

export async function POST(req: Request) {
    let data: any = {};
    try {
        data = await req.json();
    } catch {
        return NextResponse.json({ success: false, message: "Invalid request." }, { status: 400 });
    }
    const { booking: b, problems } = parseBooking(data);

    // Paid bookings are never turned away — by now the customer has paid — they are saved and flagged.
    if (!b.paymentRef) {
        if (rateLimited(req, "booking", 10, 60 * 60 * 1000)) {
            return NextResponse.json({ success: false, message: "Too many bookings from this connection — please call +91 81759 66910." }, { status: 429 });
        }
        if (problems.length) {
            return NextResponse.json({ success: false, message: problems[0] }, { status: 400 });
        }
    }

    const rideId = `KASHI-${crypto.randomInt(0, 1_000_000).toString().padStart(6, "0")}`;
    // The profile is keyed by the logged-in phone when there is one, else the passenger phone typed in.
    const session = await getSession(req);
    const customerPhone = session?.phone ?? normalizePhone(b.phone);

    let verified: Verified;
    if (b.paymentMode === "credits") {
        // Paid entirely in KashiGo coins: reserve them now (nothing has been charged yet, so problems can still refuse).
        const prep = await prepareCheckout(req, { product: b.product, coupon: b.coupon, provider: "credits" });
        if (!prep.ok) return NextResponse.json({ success: false, message: prep.message }, { status: prep.status });
        const ref = `credits:${rideId}`;
        const problem = await prep.commit(ref);
        if (problem) return NextResponse.json({ success: false, message: problem }, { status: 409 });
        b.paymentRef = ref;
        verified = { status: "paid", amount: 0, credits: prep.creditsInr, ref };
    } else {
        verified = await verifyPayment(b);
    }
    if (verified.status === "paid" && verified.ref) await finalize(verified.ref);
    await saveProfile(customerPhone, b.name, b.email);
    const notes = [...problems, ...(verified.note ? [verified.note] : [])];

    try {
        const dbError = await saveOrder(b, rideId, verified, notes, customerPhone);
        if (dbError?.code === "23505") {
            // This payment is already attached to a booking (double submit or a reused payment).
            await notifyOwner(`⚠️ Payment ${b.paymentRef} submitted again — check bookings`, b, rideId, verified, ["This payment reference is already on another booking. No new booking was saved."]);
            return NextResponse.json({ success: false, duplicate: true, message: "This payment is already linked to a booking — check your email for the confirmation." }, { status: 409 });
        }
        if (dbError) {
            console.error("Supabase Error:", dbError);
            notes.unshift(`NOT SAVED to the database (${dbError.message}) — add it manually.`);
        }

        const tag = notes.length ? "⚠️ " : "";
        await notifyOwner(`${tag}New booking ${rideId} · ${b.rideDate} · ${b.timeOfDay} · ${b.rideName}`, b, rideId, verified, notes, orderRecord(b, rideId, verified, notes, customerPhone));

        if (b.email) {
            try {
                const emailHtml = await getBookingEmailTemplate({
                    ghat: b.ghat, timeOfDay: b.timeOfDay, boatType: "Private", rideDate: b.rideDate, paymentMode: b.paymentMode,
                    amount: verified.amount + verified.credits, passengerDetails: { name: b.name, passengersCount: b.guests },
                }, rideId);
                await createTransporter().sendMail({
                    from: `"KashiGo Bookings" <${process.env.SMTP_FROM_EMAIL}>`,
                    to: b.email,
                    subject: `Booking Confirmation - ${rideId}`,
                    html: emailHtml,
                });
            } catch (emailError) {
                console.error("Nodemailer Error:", emailError);
            }
        }

        return NextResponse.json({ success: true, rideId, message: "Ride successfully booked!" });
    } catch (error: any) {
        console.error("Booking Error:", error);
        const errNotes = [...notes, error?.message || "Unknown error"];
        await notifyOwner(`⚠️ Booking ${rideId} hit an error — follow up`, b, rideId, verified, errNotes, orderRecord(b, rideId, verified, errNotes, customerPhone));
        // Still confirm to the customer: if they paid, the owner has everything needed to honour it.
        return NextResponse.json({ success: true, rideId, message: "Ride booked!" });
    }
}
