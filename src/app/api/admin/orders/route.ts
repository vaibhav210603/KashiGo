import { NextResponse } from "next/server";
import { latest, requireAdmin, searchTerm } from "@/lib/adminApi";

// All boat bookings and shop purchases, newest first. ?q= searches ride id, name and phone.
export async function GET(req: Request) {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    const q = searchTerm(new URL(req.url).searchParams.get("q"));

    const [boats, shop] = await Promise.all([
        latest("orders", (b) => (q ? b.or(`ride_id.ilike.*${q}*,passenger_name.ilike.*${q}*,passenger_phone.ilike.*${q}*,customer_phone.ilike.*${q}*`) : b)),
        latest("shop_orders", (b) => (q ? b.or(`order_ref.ilike.*${q}*,name.ilike.*${q}*,email.ilike.*${q}*,customer_phone.ilike.*${q}*,product.ilike.*${q}*`) : b)),
    ]);
    if (boats.error) console.error("Admin orders:", boats.error);
    if (shop.error) console.error("Admin shop orders:", shop.error);
    return NextResponse.json({
        boats: boats.data ?? [],
        shop: shop.data ?? [],
        errors: [boats.error?.message, shop.error?.message].filter(Boolean),
    });
}
