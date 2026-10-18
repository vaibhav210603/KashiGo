import { NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth";
import { releaseStaleHolds } from "@/lib/checkout";
import { hasServiceRole, supabaseAdmin } from "@/lib/supabaseAdmin";

// The logged-in customer's profile: coin balance, coin history and their orders.
export async function GET(req: Request) {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: "Log in first." }, { status: 401 });
    if (!hasServiceRole()) return NextResponse.json({ email: session.email, credits: 0, ledger: [], orders: [], admin: isAdmin(session.email) });

    await releaseStaleHolds(session.email);
    const db = supabaseAdmin();
    const [profile, ledger, boats, shop] = await Promise.all([
        db.from("profiles").select("name, phone, credits_inr").eq("email", session.email).maybeSingle(),
        db.from("credit_ledger").select("delta_inr, balance_after, kind, ref, note, created_at").eq("email", session.email).order("id", { ascending: false }).limit(50),
        db.from("orders").select("ride_id, ride_date, time_of_day, package_id, amount, credits_used, refunded_inr, payment_mode, payment_status").eq("customer_email", session.email).limit(50),
        db.from("shop_orders").select("order_ref, product, amount_inr, credits_used, refunded_inr, provider, created_at").eq("customer_email", session.email).order("id", { ascending: false }).limit(50),
    ]);

    return NextResponse.json({
        email: session.email,
        name: profile.data?.name ?? "",
        phone: profile.data?.phone ?? "",
        credits: Number(profile.data?.credits_inr ?? 0),
        ledger: ledger.data ?? [],
        rides: boats.data ?? [],
        purchases: shop.data ?? [],
        admin: isAdmin(session.email),
    });
}
