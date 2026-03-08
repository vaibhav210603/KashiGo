import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import { getBookingEmailTemplate } from "@/lib/emailTemplate";

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
    try {
        const data = await req.json();

        // 1. Generate a mock Ride ID (pk)
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
                    payment_status: 'pending' // For CoD it remains pending until collected
                }
            ]);

        if (dbError) {
            console.error("Supabase Error:", dbError);
            throw new Error("Failed to save order to database.");
        }

        console.log("Order saved to Supabase successfully.");

        // 3. Email Integration if Email is provided
        if (data.passengerDetails?.email) {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT),
                secure: false, // true for 465, false for other ports (587)
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });

            // HTML Email Template
            const emailHtml = await getBookingEmailTemplate(data, rideId);

            try {
                await transporter.sendMail({
                    from: `"KashiGo Bookings" <${process.env.SMTP_FROM_EMAIL}>`,
                    to: data.passengerDetails.email,
                    subject: `Booking Confirmation - ${rideId}`,
                    html: emailHtml,
                });
                console.log("Confirmation email sent successfully.");
            } catch (emailError) {
                console.error("Nodemailer Error:", emailError);
                // We don't throw here to ensure the passenger still sees the success screen even if email fails.
            }
        } else {
            console.log("No email provided by the user. Skiped email sending.");
        }

        return NextResponse.json({ success: true, rideId, message: "Ride successfully booked!" });
    } catch (error: any) {
        console.error("Booking Error:", error);
        return NextResponse.json({ success: false, message: error.message || "Failed to process booking" }, { status: 500 });
    }
}
