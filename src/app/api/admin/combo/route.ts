import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminApi";
import { listComboBookings } from "@/lib/comboOrders";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Every paid ride + consultation booking, read from Razorpay (the source of truth), with totals.
export async function GET(req: Request) {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    try {
        const bookings = await listComboBookings();
        return NextResponse.json({
            bookings,
            totals: {
                bookings: bookings.length,
                combos: bookings.filter((b) => b.plan === "combo").length,
                consults: bookings.filter((b) => b.plan === "consult").length,
                collected: bookings.reduce((s, b) => s + b.amount, 0),
            },
            configured: Boolean(process.env.RAZORPAY_KEY_SECRET),
        });
    } catch (e) {
        return NextResponse.json({ error: `Couldn't read bookings from Razorpay: ${(e as Error).message}` }, { status: 502 });
    }
}
