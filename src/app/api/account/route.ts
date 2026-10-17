import { NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth";
import { releaseStaleHolds } from "@/lib/checkout";
import { hasServiceRole, supabaseAdmin } from "@/lib/supabaseAdmin";

// The logged-in customer's profile: coin balance, coin history and their orders.
export async function GET(req: Request) {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: "Log in first." }, { status: 401 });
    if (!hasServiceRole()) return NextResponse.json({ phone: session.phone, credits: 0, ledger: [], orders: [], admin: isAdmin(session.phone) });

    await releaseStaleHolds(session.phone);
    const db = supabaseAdmin();
    const [profile, ledger, boats, shop] = await Promise.all([
        db.from("profiles").select("name, email, credits_inr").eq("phone", session.phone).maybeSingle(),
        db.from("credit_ledger").select("delta_inr, balance_after, kind, ref, note, created_at").eq("phone", session.phone).order("id", { ascending: false }).limit(50),
        db.from("orders").select("ride_id, ride_date, time_of_day, package_id, amount, credits_used, refunded_inr, payment_mode, payment_status").eq("customer_phone", session.phone).limit(50),
        db.from("shop_orders").select("order_ref, product, amount_inr, credits_used, refunded_inr, provider, created_at").eq("customer_phone", session.phone).order("id", { ascending: false }).limit(50),
    ]);

    return NextResponse.json({
        phone: session.phone,
        name: profile.data?.name ?? "",
        email: profile.data?.email ?? "",
        credits: Number(profile.data?.credits_inr ?? 0),
        ledger: ledger.data ?? [],
        rides: boats.data ?? [],
        purchases: shop.data ?? [],
        admin: isAdmin(session.phone),
    });
}
