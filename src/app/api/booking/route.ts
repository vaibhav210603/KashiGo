import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Razorpay from "razorpay";
import { createTransporter } from "@/lib/mailer";
import { getBookingEmailTemplate } from "@/lib/emailTemplate";
import { getAmountINR } from "@/lib/pricing";
import { rateLimited } from "@/lib/rateLimit";

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";
const paypalBase = process.env.NODE_ENV === "production" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

type Verified = { status: "paid" | "pending" | "unverified"; amount: number };

// Confirms an online payment with the provider so we never trust the client's
// word for it. This only decides what we record — it never blocks the booking,
// because by the time this runs the customer has already paid.
async function verifyPayment(data: any): Promise<Verified> {
    const product = data.experienceType === "package" ? data.packageId : "custom-boat";
    const listed = getAmountINR(product) ?? Number(data.amount) ?? 0;
    const ref = String(data.razorpayPaymentId || "");
    if (!ref) return { status: "pending", amount: listed }; // pay at the ghat

    try {
        if (data.paymentMode === "online_domestic") {
            const rz = new Razorpay({ key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!, key_secret: process.env.RAZORPAY_KEY_SECRET! });
            const p: any = await rz.payments.fetch(ref);
            if (p?.status === "captured" || p?.status === "authorized") return { status: "paid", amount: Number(p.amount) / 100 };
        } else if (data.paymentMode === "online_international") {
            const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
            const tok = await fetch(`${paypalBase}/v1/oauth2/token`, {
                method: "POST",
                body: "grant_type=client_credentials",
                headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
            }).then((r) => r.json());
            // The wizard sends the PayPal order id as the reference.
            const order = await fetch(`${paypalBase}/v2/checkout/orders/${encodeURIComponent(ref)}`, {
                headers: { Authorization: `Bearer ${tok.access_token}` },
            }).then((r) => r.json());
            if (order?.status === "COMPLETED") return { status: "paid", amount: listed };
        }
    } catch (err) {
        console.error("Payment verification error:", err);
    }
    return { status: "unverified", amount: listed };
}

// Lets the owner act on a booking we couldn't save or verify, instead of the customer seeing an error.
async function alertOwner(subject: string, data: any, rideId: string, note: string) {
    const to = process.env.SMTP_FROM_EMAIL;
    if (!to) return;
    const p = data.passengerDetails || {};
    const rows = [
        ["Ride ID", rideId], ["Note", note], ["Name", p.name], ["Phone", p.phone], ["Email", p.email],
        ["Passengers", p.passengersCount], ["Ghat", data.ghat], ["Date", data.rideDate], ["Time", data.timeOfDay],
        ["Package", data.packageId || "custom"], ["Payment mode", data.paymentMode], ["Payment ref", data.razorpayPaymentId || "—"],
        ["Amount", data.amount],
    ];
    try {
        await createTransporter().sendMail({
            from: `"KashiGo Bookings" <${to}>`,
            to,
            subject,
            text: rows.map(([k, v]) => `${k}: ${v ?? ""}`).join("\n"),
        });
    } catch (err) {
        console.error("Owner alert failed:", err);
    }
}

export async function POST(req: Request) {
    if (rateLimited(req, "booking", 10, 60 * 60 * 1000)) {
        return NextResponse.json({ success: false, message: "Too many bookings from this connection — please call +91 81759 66910." }, { status: 429 });
    }
    let data: any = {};
    const rideId = `KASHI-${Math.floor(Math.random() * 1000000).toString().padStart(6, "0")}`;
    try {
        data = await req.json();
        const verified = await verifyPayment(data);
        data.amount = verified.amount;

        const { error: dbError } = await supabase
            .from("orders")
            .insert([
                {
                    ride_id: rideId,
                    ghat: data.ghat,
                    time_of_day: data.timeOfDay,
                    boat_type: data.boatType,
                    package_id: data.packageId,
                    passenger_name: data.passengerDetails?.name,
                    passenger_phone: data.passengerDetails?.phone,
                    passenger_email: data.passengerDetails?.email,
                    passengers_count: data.passengerDetails?.passengersCount,
                    amount: data.amount,
                    payment_mode: data.paymentMode || "cod",
                    payment_status: verified.status,
                    razorpay_payment_id: data.razorpayPaymentId || null,
                }
            ]);

        if (dbError) {
            console.error("Supabase Error:", dbError);
            await alertOwner(`⚠️ Booking ${rideId} NOT saved — add manually`, data, rideId, `Database error: ${dbError.message}`);
        } else if (verified.status === "unverified") {
            await alertOwner(`⚠️ Check payment for booking ${rideId}`, data, rideId, "Payment could not be confirmed with the provider — check the dashboard.");
        }

        // Booking confirmation email — sent whether or not the DB write worked,
        // the owner alert above covers the follow-up.
        if (data.passengerDetails?.email) {
            try {
                const emailHtml = await getBookingEmailTemplate({ ...data, rideDate: data.rideDate || "" }, rideId);
                await createTransporter().sendMail({
                    from: `"KashiGo Bookings" <${process.env.SMTP_FROM_EMAIL}>`,
                    to: data.passengerDetails.email,
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
        await alertOwner(`⚠️ Booking ${rideId} hit an error — follow up`, data, rideId, error?.message || "Unknown error");
        // Still confirm to the customer: if they paid, the owner has everything needed to honour it.
        return NextResponse.json({ success: true, rideId, message: "Ride booked!" });
    }
}
