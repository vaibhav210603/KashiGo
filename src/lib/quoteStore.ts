// Server-only storage for quotations: the Supabase `quotes` table (supabase/quotes.sql), plus the hand-made ones in lib/quotes.ts.
// Without a service-role key (local dev) quotes are kept in memory so the admin generator can still be tried out.
import { hasServiceRole, supabaseAdmin } from "@/lib/supabaseAdmin";
import { STATIC_QUOTES, quoteTotal, type Quote } from "@/lib/quotes";

export type QuoteRow = { quote: Quote; createdAt: string; createdBy: string | null; paidAt: string | null; paymentId: string | null };

const memory: Map<string, QuoteRow> = ((globalThis as { __kgQuotes?: Map<string, QuoteRow> }).__kgQuotes ??= new Map());
const inMemory = () => !hasServiceRole() && process.env.NODE_ENV !== "production";

const MISSING = "The quotes table isn't set up yet — run supabase/quotes.sql in the Supabase SQL editor.";
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- PostgREST error shape
const dbError = (e: any) => new Error(e?.code === "42P01" || e?.code === "PGRST205" ? MISSING : e?.message || "Database error.");
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- a row of the quotes table
const toRow = (r: any): QuoteRow => ({ quote: r.data, createdAt: r.created_at, createdBy: r.created_by, paidAt: r.paid_at, paymentId: r.payment_id });

export async function getQuote(id: string): Promise<Quote | null> {
    if (!/^KG-Q-[0-9]{6}-[A-Z0-9-]{1,12}$/.test(id)) return null;
    if (STATIC_QUOTES[id]) return STATIC_QUOTES[id];
    if (inMemory()) return memory.get(id)?.quote ?? null;
    if (!hasServiceRole()) return null;
    const { data, error } = await supabaseAdmin().from("quotes").select("data").eq("id", id).maybeSingle();
    if (error) { console.error("Quote lookup failed:", error.message); return null; }
    return data?.data ?? null;
}

export async function listQuotes(limit = 100): Promise<QuoteRow[]> {
    const statics: QuoteRow[] = Object.values(STATIC_QUOTES).map((q) => ({ quote: q, createdAt: `${q.issued}T00:00:00+05:30`, createdBy: null, paidAt: null, paymentId: null }));
    let rows: QuoteRow[];
    if (inMemory()) rows = [...memory.values()];
    else {
        const { data, error } = await supabaseAdmin().from("quotes").select("*").order("created_at", { ascending: false }).limit(limit);
        if (error) throw dbError(error);
        rows = (data ?? []).map(toRow);
    }
    return [...rows, ...statics].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function quoteIdTaken(id: string): Promise<boolean> {
    return Boolean(STATIC_QUOTES[id]) || (await getQuote(id)) !== null;
}

export async function saveQuote(q: Quote, createdBy: string): Promise<void> {
    if (inMemory()) { memory.set(q.id, { quote: q, createdAt: new Date().toISOString(), createdBy, paidAt: null, paymentId: null }); return; }
    const { error } = await supabaseAdmin().from("quotes").insert({ id: q.id, data: q, total_inr: quoteTotal(q), created_by: createdBy });
    if (error) throw dbError(error);
}

export async function deleteQuote(id: string): Promise<void> {
    if (STATIC_QUOTES[id]) throw new Error("This quotation is built into the site and can't be deleted here.");
    if (inMemory()) { memory.delete(id); return; }
    const { error } = await supabaseAdmin().from("quotes").delete().eq("id", id);
    if (error) throw dbError(error);
}

// Best effort — the Razorpay order is the source of truth for "paid"; this just makes the admin list quicker.
export async function markQuotePaid(id: string, paymentId: string): Promise<void> {
    if (STATIC_QUOTES[id]) return;
    if (inMemory()) { const r = memory.get(id); if (r) memory.set(id, { ...r, paidAt: new Date().toISOString(), paymentId }); return; }
    if (!hasServiceRole()) return;
    const { error } = await supabaseAdmin().from("quotes").update({ paid_at: new Date().toISOString(), payment_id: paymentId }).eq("id", id);
    if (error) console.error("Couldn't mark quote paid:", error.message);
}
