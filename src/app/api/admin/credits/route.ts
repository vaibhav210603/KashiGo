import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminApi";
import { normalizeEmail } from "@/lib/email";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Look up a customer's coins (GET ?email=) or add / remove coins by hand (POST { email, amount, note }).
export async function GET(req: Request) {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    const email = normalizeEmail(new URL(req.url).searchParams.get("email"));
    if (!email) return NextResponse.json({ error: "Enter the customer's email address." }, { status: 400 });
    const db = supabaseAdmin();
    const [profile, ledger] = await Promise.all([
        db.from("profiles").select("email, name, phone, credits_inr, user_id").eq("email", email).maybeSingle(),
        db.from("credit_ledger").select("delta_inr, balance_after, kind, ref, note, created_by, created_at").eq("email", email).order("id", { ascending: false }).limit(50),
    ]);
    return NextResponse.json({ email, profile: profile.data, ledger: ledger.data ?? [] });
}

export async function POST(req: Request) {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    try {
        const { email, amount, note } = await req.json();
        const e = normalizeEmail(email);
        const amt = Math.round(Number(amount));
        if (!e || !amt) return NextResponse.json({ error: "Enter an email address and a non-zero amount." }, { status: 400 });
        const { data, error } = await supabaseAdmin().rpc("credit_add", { p_email: e, p_amount: amt, p_kind: "adjust", p_ref: null, p_note: String(note || "").slice(0, 200) || null, p_by: admin.email });
        if (error) return NextResponse.json({ error: error.message.includes("insufficient") ? "They don't have that many coins." : error.message }, { status: 400 });
        return NextResponse.json({ ok: true, email: e, balance: data });
    } catch {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
}
