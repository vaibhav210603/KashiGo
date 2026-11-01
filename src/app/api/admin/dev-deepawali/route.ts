import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminApi";
import { listDdBookings } from "@/lib/devDeepawaliOrders";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Every paid Dev Deepawali booking, read from Razorpay (the source of truth), with seat and money totals.
export async function GET(req: Request) {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    try {
        const bookings = await listDdBookings();
        return NextResponse.json({
            bookings,
            totals: {
                bookings: bookings.length,
                seats: bookings.reduce((s, b) => s + (b.guests ?? 0), 0),
                collected: bookings.reduce((s, b) => s + b.amount, 0),
                dueAtGhat: bookings.reduce((s, b) => s + b.dueInr, 0),
            },
            configured: Boolean(process.env.RAZORPAY_KEY_SECRET),
        });
    } catch (e) {
        return NextResponse.json({ error: `Couldn't read bookings from Razorpay: ${(e as Error).message}` }, { status: 502 });
    }
}
