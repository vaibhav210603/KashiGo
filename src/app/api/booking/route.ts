import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import { getBookingEmailTemplate, getRefundEmailTemplate } from "@/lib/emailTemplate";

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const createTransporter = () => nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function POST(req: Request) {
    try {
        const data = await req.json();

        // 1. Generate Ride ID
        const rideId = `KASHI-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

        // 2. Supabase Integration
        const { error: dbError } = await supabase
            .from('orders')
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
                    payment_mode: data.paymentMode || 'cod',
                    payment_status: data.paymentMode === 'online' ? 'paid' : 'pending',
                    razorpay_payment_id: data.razorpayPaymentId || null,
                }
            ]);

        if (dbError) {
            console.error("Supabase Error:", dbError);

            // If a Razorpay payment was already captured, notify the customer about refund
            if (data.razorpayPaymentId && data.passengerDetails?.email) {
                try {
                    const refundHtml = getRefundEmailTemplate({
                        name: data.passengerDetails.name,
                        email: data.passengerDetails.email,
                        amount: data.amount,
                        razorpayPaymentId: data.razorpayPaymentId,
                    });
                    await createTransporter().sendMail({
                        from: `"KashiGo Bookings" <${process.env.SMTP_FROM_EMAIL}>`,
                        to: data.passengerDetails.email,
                        subject: `Important: Payment Received – Your Refund is Being Processed`,
                        html: refundHtml,
                    });
                    console.log("Refund notification email sent.");
                } catch (emailErr) {
                    console.error("Failed to send refund email:", emailErr);
                }

                return NextResponse.json({
                    success: false,
                    refundInitiated: true,
                    message: "Your payment was received but we encountered an issue saving your booking. A refund of ₹" + data.amount + " will be processed in 5–7 working days. A confirmation has been sent to your email."
                }, { status: 500 });
            }

            throw new Error("Failed to save order to database.");
        }

        console.log("Order saved to Supabase successfully.");

        // 3. Booking Confirmation Email
        if (data.passengerDetails?.email) {
            try {
                const emailHtml = await getBookingEmailTemplate({ ...data, rideDate: data.rideDate || '' }, rideId);
                await createTransporter().sendMail({
                    from: `"KashiGo Bookings" <${process.env.SMTP_FROM_EMAIL}>`,
                    to: data.passengerDetails.email,
                    subject: `Booking Confirmation - ${rideId}`,
                    html: emailHtml,
                });
                console.log("Confirmation email sent successfully.");
            } catch (emailError) {
                console.error("Nodemailer Error:", emailError);
                // Don't throw — booking is saved, email is non-critical
            }
        } else {
            console.log("No email provided. Skipped email sending.");
        }

        return NextResponse.json({ success: true, rideId, message: "Ride successfully booked!" });
    } catch (error: any) {
        console.error("Booking Error:", error);
        return NextResponse.json({ success: false, message: error.message || "Failed to process booking" }, { status: 500 });
    }
}

