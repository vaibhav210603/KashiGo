import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminApi";
import { normalizeEmail } from "@/lib/email";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Refund an order as KashiGo coins to the email that booked it. Body: { kind: "boat"|"shop", key, amount, note, email? }
// `email` is only used for orders saved without a customer email (older bookings).
export async function POST(req: Request) {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    try {
        const { kind, key, amount, note, email } = await req.json();
        const amt = Math.round(Number(amount));
        if (!["boat", "shop"].includes(kind) || !key || !(amt > 0)) return NextResponse.json({ error: "Pick an order and a refund amount." }, { status: 400 });
        const db = supabaseAdmin();

        if (email) {
            const e = normalizeEmail(email);
            if (!e) return NextResponse.json({ error: "That email address doesn't look right." }, { status: 400 });
            const table = kind === "boat" ? "orders" : "shop_orders";
            const col = kind === "boat" ? "ride_id" : "order_ref";
            await db.from(table).update({ customer_email: e }).eq(col, String(key)).is("customer_email", null);
        }

        const { data, error } = await db.rpc("refund_order", { p_kind: kind, p_key: String(key), p_amount: amt, p_note: String(note || "").slice(0, 200) || null, p_by: admin.email });
        if (error) return NextResponse.json({ error: error.message.replace(/^.*?: /, "") }, { status: 400 });
        return NextResponse.json({ ok: true, balance: data });
    } catch {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
}
