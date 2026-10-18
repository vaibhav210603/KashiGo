import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminApi";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const KINDS = ["percent", "amount_off", "fixed_price"];
const SCOPES = /^(all|boat|shop|guide|india-tour|p[1-6]|custom-boat|india-scam-proof|kashi-unveiled|walk-the-ghats|scam-proof-audiobook|complete-bundle)$/;

// Validates the editable fields of a coupon; returns the clean row or an error message.
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- untrusted JSON, every field is checked below
function clean(body: any, creating: boolean): { row?: Record<string, unknown>; error?: string } {
    const row: Record<string, unknown> = {};
    if (creating) {
        const code = String(body.code || "").trim().toUpperCase();
        if (!/^[A-Z0-9_-]{3,30}$/.test(code)) return { error: "Codes are 3–30 letters, numbers, - or _." };
        row.code = code;
    }
    if (creating || body.kind !== undefined) {
        if (!KINDS.includes(body.kind)) return { error: "Pick a discount type." };
        row.kind = body.kind;
    }
    if (creating || body.value !== undefined) {
        const v = Number(body.value);
        if (!(v > 0) || (body.kind === "percent" && v > 100)) return { error: "Enter a discount value (percent: 1–100, rupees: above 0)." };
        row.value = v;
    }
    if (creating || body.applies_to !== undefined) {
        const scopes = (Array.isArray(body.applies_to) ? body.applies_to : String(body.applies_to || "all").split(",")).map((s: string) => s.trim()).filter(Boolean);
        if (!scopes.length || !scopes.every((s: string) => SCOPES.test(s))) return { error: "Unknown 'applies to' value." };
        row.applies_to = scopes;
    }
    for (const k of ["max_uses", "per_customer_limit"]) {
        if (body[k] !== undefined) {
            const n = body[k] === null || body[k] === "" ? null : Math.trunc(Number(body[k]));
            if (n !== null && !(n > 0)) return { error: "Limits must be blank (unlimited) or a number above 0." };
            row[k] = n;
        }
    }
    for (const k of ["starts_at", "expires_at"]) {
        if (body[k] !== undefined) {
            if (body[k] === null || body[k] === "") row[k] = null;
            else if (Number.isNaN(Date.parse(body[k]))) return { error: "Invalid date." };
            else row[k] = new Date(body[k]).toISOString();
        }
    }
    if (body.active !== undefined) row.active = Boolean(body.active);
    if (body.note !== undefined) row.note = String(body.note || "").slice(0, 200) || null;
    return { row };
}

export async function GET(req: Request) {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    const db = supabaseAdmin();
    const [coupons, uses] = await Promise.all([
        db.from("coupons").select("*").order("created_at", { ascending: false }),
        db.from("coupon_uses").select("code").eq("status", "paid").limit(10000),
    ]);
    if (coupons.error) return NextResponse.json({ error: coupons.error.message, coupons: [] }, { status: 500 });
    const count: Record<string, number> = {};
    for (const u of uses.data ?? []) count[u.code] = (count[u.code] || 0) + 1;
    return NextResponse.json({ coupons: (coupons.data ?? []).map((c) => ({ ...c, uses: count[c.code] || 0 })) });
}

// Goes live immediately — checkout reads the coupons table on every request.
export async function POST(req: Request) {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    const body = await req.json().catch(() => ({}));
    const { row, error } = clean(body, true);
    if (error) return NextResponse.json({ error }, { status: 400 });
    const { data, error: dbError } = await supabaseAdmin().from("coupons").insert({ ...row, active: row!.active ?? true, created_by: admin.email }).select().single();
    if (dbError) return NextResponse.json({ error: dbError.code === "23505" ? "A coupon with that code already exists." : dbError.message }, { status: 400 });
    return NextResponse.json({ coupon: data });
}

export async function PATCH(req: Request) {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    const body = await req.json().catch(() => ({}));
    const code = String(body.code || "").toUpperCase();
    const { row, error } = clean(body, false);
    if (!code || error) return NextResponse.json({ error: error || "Which coupon?" }, { status: 400 });
    const { data, error: dbError } = await supabaseAdmin().from("coupons").update(row!).eq("code", code).select().single();
    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 });
    return NextResponse.json({ coupon: data });
}

export async function DELETE(req: Request) {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    const code = String(new URL(req.url).searchParams.get("code") || "").toUpperCase();
    if (!code) return NextResponse.json({ error: "Which coupon?" }, { status: 400 });
    const { error } = await supabaseAdmin().from("coupons").delete().eq("code", code);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
}
