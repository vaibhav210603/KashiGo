import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminApi";
import { normalizePhone } from "@/lib/phone";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Look up a customer's coins (GET ?phone=) or add / remove coins by hand (POST { phone, amount, note }).
export async function GET(req: Request) {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    const phone = normalizePhone(new URL(req.url).searchParams.get("phone"));
    if (!phone) return NextResponse.json({ error: "Enter a phone number with country code." }, { status: 400 });
    const db = supabaseAdmin();
    const [profile, ledger] = await Promise.all([
        db.from("profiles").select("phone, name, email, credits_inr, user_id").eq("phone", phone).maybeSingle(),
        db.from("credit_ledger").select("delta_inr, balance_after, kind, ref, note, created_by, created_at").eq("phone", phone).order("id", { ascending: false }).limit(50),
    ]);
    return NextResponse.json({ phone, profile: profile.data, ledger: ledger.data ?? [] });
}

export async function POST(req: Request) {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    try {
        const { phone, amount, note } = await req.json();
        const p = normalizePhone(phone);
        const amt = Math.round(Number(amount));
        if (!p || !amt) return NextResponse.json({ error: "Enter a phone number (with country code) and a non-zero amount." }, { status: 400 });
        const { data, error } = await supabaseAdmin().rpc("credit_add", { p_phone: p, p_amount: amt, p_kind: "adjust", p_ref: null, p_note: String(note || "").slice(0, 200) || null, p_by: admin.phone });
        if (error) return NextResponse.json({ error: error.message.includes("insufficient") ? "They don't have that many coins." : error.message }, { status: 400 });
        return NextResponse.json({ ok: true, phone: p, balance: data });
    } catch {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
}
