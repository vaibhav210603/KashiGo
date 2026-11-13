import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminApi";
import { addLead, deleteLead, listLeads, updateLead } from "@/lib/leads";
import { parseLeadText } from "@/lib/leadsShared";

export const dynamic = "force-dynamic";

const fail = (e: unknown, what: string) => {
    const msg = (e as Error).message || "";
    const hint = /relation .*leads|does not exist|schema cache/i.test(msg) ? " — run supabase/leads.sql in the Supabase SQL editor first." : "";
    return NextResponse.json({ error: `Couldn't ${what}: ${msg}${hint}` }, { status: 502 });
};

// Every lead, newest first.
export async function GET(req: Request) {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    try { return NextResponse.json({ leads: await listLeads() }); } catch (e) { return fail(e, "read leads"); }
}

// New lead: either fields, or { text } pasted from a chat which is parsed the same way the WhatsApp bot does.
export async function POST(req: Request) {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    const b = await req.json().catch(() => ({}));
    const draft = typeof b?.text === "string" && b.text.trim() ? { ...parseLeadText(b.text), ...(b.source ? { source: b.source } : {}) } : b;
    if (!draft?.name && !draft?.phone) return NextResponse.json({ error: "Add at least a name or a phone number." }, { status: 400 });
    try { return NextResponse.json(await addLead(draft, "admin")); } catch (e) { return fail(e, "save the lead"); }
}

// { id, ...changes, note? }
export async function PATCH(req: Request) {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    const { id, note, ...changes } = await req.json().catch(() => ({}));
    if (!Number.isInteger(id)) return NextResponse.json({ error: "Which lead?" }, { status: 400 });
    try { return NextResponse.json({ lead: await updateLead(id, changes, "admin", note) }); } catch (e) { return fail(e, "update the lead"); }
}

export async function DELETE(req: Request) {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!Number.isInteger(id)) return NextResponse.json({ error: "Which lead?" }, { status: 400 });
    try { await deleteLead(id); return NextResponse.json({ ok: true }); } catch (e) { return fail(e, "delete the lead"); }
}
