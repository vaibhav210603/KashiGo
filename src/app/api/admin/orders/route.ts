import { NextResponse } from "next/server";
import { latest, requireAdmin, searchTerm } from "@/lib/adminApi";
import { boatRow, fetchOrdersFromMail, mailboxConfigured, shopRow, syncOrdersToDb, type OrderRecord } from "@/lib/orderMail";
import { hasServiceRole } from "@/lib/supabaseAdmin";
import { listPaidQuoteRecords } from "@/lib/quotePayments";
import { getQuote } from "@/lib/quoteStore";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

type Src = { email: boolean; db: boolean; razorpay?: boolean };

// A table that was never created (its SQL file hasn't been run in Supabase yet).
const MISSING_TABLE: Record<string, string> = {
    shop_orders: "Guide purchases can't be saved yet: the shop_orders table is missing. Run supabase/accounts_credits_admin.sql once in the Supabase SQL editor.",
};
const tableError = (table: string, e: unknown) => {
    const err = e as { code?: string; message?: string };
    return err?.code === "PGRST205" || err?.code === "42P01" || /schema cache|does not exist/i.test(String(err?.message)) ? MISSING_TABLE[table] ?? String(err?.message) : String(err?.message ?? e);
};

// All boat bookings and shop purchases, newest first. ?q= searches ride id, name, email, phone, product.
// Primary source: the order emails in the owner's mailbox (works with the database paused).
// Secondary: Supabase. Orders found only in email are copied into Supabase while we're here.
export async function GET(req: Request) {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    const q = searchTerm(new URL(req.url).searchParams.get("q"));

    const [mail, boats, shop, quotePaid] = await Promise.all([
        mailboxConfigured()
            ? fetchOrdersFromMail().then((records) => ({ records, error: null as string | null })).catch((e: Error) => ({ records: [] as OrderRecord[], error: e.message }))
            : Promise.resolve({ records: [] as OrderRecord[], error: "No mailbox configured — set IMAP_* (or SMTP_*) env vars." }),
        hasServiceRole()
            ? latest("orders", (b) => (q ? b.or(`ride_id.ilike.*${q}*,passenger_name.ilike.*${q}*,passenger_phone.ilike.*${q}*,passenger_email.ilike.*${q}*,customer_email.ilike.*${q}*`) : b)).catch((e: Error) => ({ data: null, error: e }))
            : Promise.resolve({ data: null, error: { message: "SUPABASE_SERVICE_ROLE_KEY isn't set." } }),
        hasServiceRole()
            ? latest("shop_orders", (b) => (q ? b.or(`order_ref.ilike.*${q}*,name.ilike.*${q}*,phone.ilike.*${q}*,customer_email.ilike.*${q}*,product.ilike.*${q}*`) : b)).catch((e: Error) => ({ data: null, error: e }))
            : Promise.resolve({ data: null, error: { message: "SUPABASE_SERVICE_ROLE_KEY isn't set." } }),
        // Quotations paid on kashigo.in/quote/<id>, read from Razorpay itself.
        listPaidQuoteRecords(getQuote).then((records) => ({ records, error: null as string | null })).catch((e: Error) => ({ records: [] as OrderRecord[], error: e.message })),
    ]);
    const dbOk = !boats.error;

    const needle = q.toLowerCase();
    const matches = (r: OrderRecord) => !needle || [r.key, r.name, r.phone, r.customer_email, r.email, r.product].some((v) => String(v ?? "").toLowerCase().includes(needle));
    // Razorpay quote payments the mailbox doesn't have yet join the email ones (same record shape).
    const mailKeys = new Set(mail.records.map((r) => r.key));
    const fromRazorpay = new Set(quotePaid.records.map((r) => r.key));
    const emailed = [...mail.records, ...quotePaid.records.filter((r) => !mailKeys.has(r.key))].filter(matches);

    // Copy email-only orders into the database (the database is the secondary copy).
    const dbBoatKeys = new Set((boats.data ?? []).map((o: { ride_id: string }) => o.ride_id));
    const dbShopKeys = new Set((shop.data ?? []).map((o: { order_ref: string }) => o.order_ref));
    const missing = emailed.filter((r) => (r.kind === "boat" ? !dbBoatKeys.has(r.key) : !dbShopKeys.has(r.key)));
    const sync = dbOk && missing.length ? await syncOrdersToDb(missing) : { added: 0 };
    // Only count them as in the database if it was reachable and the copy succeeded.
    const synced = new Set(dbOk && !sync.error ? missing.map((r) => r.key) : []);

    // Merge by key: database row when there is one (it carries refunds), else the email copy.
    const mergeBoats = new Map<string, Record<string, unknown> & { _src: Src }>();
    for (const o of boats.data ?? []) mergeBoats.set(o.ride_id, { ...o, _src: { email: false, db: true } });
    const mergeShop = new Map<string, Record<string, unknown> & { _src: Src }>();
    for (const o of shop.data ?? []) mergeShop.set(o.order_ref, { ...o, _src: { email: false, db: true } });
    for (const r of emailed) {
        const map = r.kind === "boat" ? mergeBoats : mergeShop;
        const existing = map.get(r.key);
        const inMail = mailKeys.has(r.key);
        if (existing) { existing._src.email ||= inMail; existing._src.razorpay ||= fromRazorpay.has(r.key); }
        else map.set(r.key, { ...(r.kind === "boat" ? boatRow(r) : shopRow(r)), refunded_inr: 0, _src: { email: inMail, db: synced.has(r.key), razorpay: fromRazorpay.has(r.key) } });
    }
    const newest = (a: Record<string, unknown>, b: Record<string, unknown>) => String(b.created_at ?? "").localeCompare(String(a.created_at ?? ""));

    return NextResponse.json({
        boats: [...mergeBoats.values()].sort(newest),
        shop: [...mergeShop.values()].sort(newest),
        sources: {
            email: { ok: !mail.error, count: mail.records.length, error: mail.error },
            db: { ok: dbOk, error: boats.error ? String((boats.error as { message?: string }).message ?? boats.error) : null },
            synced: sync.added,
            syncError: sync.error ? tableError("shop_orders", { message: sync.error }) : null,
            quotes: quotePaid.records.length,
        },
        // Shop table problems while the orders table works (e.g. the accounts migration hasn't run yet).
        errors: [
            ...(dbOk && shop.error ? [tableError("shop_orders", shop.error)] : []),
            ...(quotePaid.error ? [`Couldn't read quotation payments from Razorpay: ${quotePaid.error}`] : []),
        ],
    });
}
