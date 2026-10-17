import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminApi";
import { normalizePhone } from "@/lib/phone";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Refund an order as KashiGo coins to the phone that booked it. Body: { kind: "boat"|"shop", key, amount, note, phone? }
// `phone` is only used for older orders saved before customer phones were recorded.
export async function POST(req: Request) {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    try {
        const { kind, key, amount, note, phone } = await req.json();
        const amt = Math.round(Number(amount));
        if (!["boat", "shop"].includes(kind) || !key || !(amt > 0)) return NextResponse.json({ error: "Pick an order and a refund amount." }, { status: 400 });
        const db = supabaseAdmin();

        if (phone) {
            const p = normalizePhone(phone);
            if (!p) return NextResponse.json({ error: "That phone number doesn't look right — include the country code." }, { status: 400 });
            const table = kind === "boat" ? "orders" : "shop_orders";
            const col = kind === "boat" ? "ride_id" : "order_ref";
            await db.from(table).update({ customer_phone: p }).eq(col, String(key)).is("customer_phone", null);
        }

        const { data, error } = await db.rpc("refund_order", { p_kind: kind, p_key: String(key), p_amount: amt, p_note: String(note || "").slice(0, 200) || null, p_by: admin.phone });
        if (error) return NextResponse.json({ error: error.message.replace(/^.*?: /, "") }, { status: 400 });
        return NextResponse.json({ ok: true, balance: data });
    } catch {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
}
