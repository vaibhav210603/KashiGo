// Server-only: the leads table (supabase/leads.sql). Used by /api/admin/leads, the WhatsApp bot and the website forms.
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { addDays, FOLLOW_UP_DAYS, SOURCES, STATUS_LABEL, STATUSES, todayIST, type Lead, type LeadDraft, type LeadStatus } from "@/lib/leadsShared";
import { normalizePhone } from "@/lib/phone";

const TABLE = "leads";
const clean = (v: unknown, max: number) => String(v ?? "").replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, " ").trim().slice(0, max);
const event = (by: string, text: string) => ({ at: new Date().toISOString(), by, text });

// Keeps only known, well-formed fields.
export function sanitize(d: Record<string, unknown>): LeadDraft & { status?: LeadStatus; follow_up_on?: string | null } {
    const out: LeadDraft & { status?: LeadStatus; follow_up_on?: string | null } = {};
    if ("name" in d) out.name = clean(d.name, 80);
    if ("phone" in d) out.phone = d.phone ? normalizePhone(clean(d.phone, 24)) : null;
    if ("source" in d && SOURCES.includes(d.source as never)) out.source = d.source as LeadDraft["source"];
    if ("interest" in d) out.interest = clean(d.interest, 120);
    if ("notes" in d) out.notes = clean(d.notes, 1000);
    if ("travel_date" in d) out.travel_date = /^\d{4}-\d{2}-\d{2}$/.test(String(d.travel_date)) ? String(d.travel_date) : null;
    if ("follow_up_on" in d) out.follow_up_on = /^\d{4}-\d{2}-\d{2}$/.test(String(d.follow_up_on)) ? String(d.follow_up_on) : null;
    if ("pax" in d) { const n = Math.trunc(Number(d.pax)); out.pax = n >= 1 && n <= 500 ? n : null; }
    if ("amount_inr" in d) { const n = Math.round(Number(d.amount_inr)); out.amount_inr = n >= 0 && n < 1e8 && d.amount_inr !== "" && d.amount_inr !== null ? n : null; }
    if ("status" in d && STATUSES.includes(d.status as never)) out.status = d.status as LeadStatus;
    return out;
}

export async function listLeads(limit = 1000): Promise<Lead[]> {
    const { data, error } = await supabaseAdmin().from(TABLE).select("*").order("created_at", { ascending: false }).limit(limit);
    if (error) throw new Error(error.message);
    return data as Lead[];
}

export async function getLead(id: number): Promise<Lead | null> {
    const { data, error } = await supabaseAdmin().from(TABLE).select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data as Lead | null;
}

// An open lead (not booked/lost) with the same phone is updated instead of duplicated; empty fields never overwrite filled ones.
export async function addLead(draft: LeadDraft, by: string): Promise<{ lead: Lead; created: boolean }> {
    const d = sanitize(draft as Record<string, unknown>);
    const db = supabaseAdmin();
    if (d.phone) {
        const { data: open } = await db.from(TABLE).select("*").eq("phone", d.phone).not("status", "in", "(booked,lost)").order("created_at", { ascending: false }).limit(1);
        const existing = open?.[0] as Lead | undefined;
        if (existing) {
            const patch: Record<string, unknown> = {};
            for (const k of ["name", "source", "interest", "travel_date", "pax", "amount_inr"] as const) if (d[k] != null && d[k] !== "" && !existing[k]) patch[k] = d[k];
            if (d.notes && !existing.notes.includes(d.notes)) patch.notes = [existing.notes, d.notes].filter(Boolean).join("\n—\n").slice(-4000);
            patch.history = [...(existing.history || []), event(by, "Enquired again")];
            patch.updated_at = new Date().toISOString();
            const { data, error } = await db.from(TABLE).update(patch).eq("id", existing.id).select("*").single();
            if (error) throw new Error(error.message);
            return { lead: data as Lead, created: false };
        }
    }
    const row = { ...d, status: d.status ?? "new", follow_up_on: todayIST(), added_by: clean(by, 60), history: [event(by, "Lead added")] };
    const { data, error } = await db.from(TABLE).insert(row).select("*").single();
    if (error) throw new Error(error.message);
    return { lead: data as Lead, created: true };
}

// Field edits, a status change (which also schedules the next follow-up) and/or a note, recorded in the history.
export async function updateLead(id: number, changes: Record<string, unknown>, by: string, note?: string): Promise<Lead> {
    const lead = await getLead(id);
    if (!lead) throw new Error(`No lead #${id}.`);
    const d = sanitize(changes);
    const history = [...(lead.history || [])];
    if (d.status && d.status !== lead.status) {
        history.push(event(by, `${STATUS_LABEL[lead.status]} → ${STATUS_LABEL[d.status]}`));
        if (!("follow_up_on" in d)) { const n = FOLLOW_UP_DAYS[d.status]; d.follow_up_on = n == null ? null : addDays(todayIST(), n); }
    }
    const n = clean(note, 600);
    if (n) history.push(event(by, n));
    const { data, error } = await supabaseAdmin().from(TABLE).update({ ...d, history, updated_at: new Date().toISOString() }).eq("id", id).select("*").single();
    if (error) throw new Error(error.message);
    return data as Lead;
}

export async function deleteLead(id: number) {
    const { error } = await supabaseAdmin().from(TABLE).delete().eq("id", id);
    if (error) throw new Error(error.message);
}

// Remembers which bot message is about which lead, so the worker can just reply "booked" to it.
export async function linkBotMessage(id: number, waMessageId: string) {
    const lead = await getLead(id);
    if (!lead) return;
    const ids = [...((lead as Lead & { bot_msg_ids?: string[] }).bot_msg_ids || []), waMessageId].slice(-30);
    await supabaseAdmin().from(TABLE).update({ bot_msg_ids: ids }).eq("id", id);
}
export async function leadForBotMessage(waMessageId: string): Promise<Lead | null> {
    const { data } = await supabaseAdmin().from(TABLE).select("*").contains("bot_msg_ids", [waMessageId]).limit(1);
    return (data?.[0] as Lead) ?? null;
}

// Website forms call this; a CRM hiccup must never break the form.
export async function captureLead(draft: LeadDraft, by: string) {
    try { await addLead(draft, by); } catch (e) { console.error("Lead capture failed:", e); }
}
