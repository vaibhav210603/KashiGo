// Server-only. Orders don't depend on the database: every order email to the owner carries the order as a
// machine-readable attachment (kashigo-order.json, plus an X-KashiGo-Order header). The admin panel reads
// orders back out of the mailbox, and copies any the database doesn't have into Supabase (syncOrdersToDb),
// so Supabase is a secondary copy — if it's paused or down, the order list still works from email.
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { hasServiceRole, supabaseAdmin } from "@/lib/supabaseAdmin";

export type OrderRecord = {
    v: 1;
    kind: "boat" | "shop";
    key: string;              // ride id (KASHI-123456) or shop order ref
    created_at: string;       // ISO
    product: string;          // p1–p6, custom-boat, or a shop product id
    name: string;
    customer_email: string | null; // lower-case — whose KashiGo coins a refund goes to
    phone: string;            // as typed by the customer, for the boatman
    email: string;
    payment_mode: string;     // cod | online_domestic | online_international | credits | razorpay | paypal
    payment_status: string;   // paid | pending | unverified
    payment_ref: string;
    amount: number;           // cash paid, rupees
    amount_usd?: number | null;
    credits_used: number;
    coupon: string | null;
    notes: string;
    // boat only
    ghat?: string;
    ride_date?: string;
    time_of_day?: string;
    guests?: number;
    custom?: unknown;
};

const FILENAME = "kashigo-order.json";
const HEADER = "X-KashiGo-Order";

// Spread into nodemailer's sendMail options.
export function orderMailParts(rec: OrderRecord) {
    return {
        headers: { [HEADER]: `v1; ${rec.kind}; ${rec.key}` },
        attachments: [{ filename: FILENAME, content: JSON.stringify(rec, null, 2), contentType: "application/json" }],
    };
}

export async function parseOrderEmail(raw: Buffer | string): Promise<OrderRecord | null> {
    try {
        const mail = await simpleParser(raw);
        const att = mail.attachments.find((a) => a.filename === FILENAME);
        if (!att) return null;
        const rec = JSON.parse(att.content.toString("utf8"));
        if (rec?.v !== 1 || !rec.key || (rec.kind !== "boat" && rec.kind !== "shop")) return null;
        return rec as OrderRecord;
    } catch {
        return null;
    }
}

// Which IMAP account to read: IMAP_* if set, else the SMTP login the site already sends with.
function imapConfig() {
    const user = process.env.IMAP_USER || process.env.SMTP_USER || "";
    const pass = process.env.IMAP_PASS || process.env.SMTP_PASS || "";
    const smtpHost = process.env.SMTP_HOST || "";
    const host = process.env.IMAP_HOST || (smtpHost.startsWith("smtp.") ? smtpHost.replace(/^smtp\./, "imap.") : smtpHost);
    return { host, user, pass, port: Number(process.env.IMAP_PORT || 993), gmail: /gmail|googlemail/i.test(host) };
}

export const mailboxConfigured = () => { const c = imapConfig(); return Boolean(c.host && c.user && c.pass); };

// Orders found in the mailbox from the last `days` days, newest first, one per key (the latest email wins).
export async function fetchOrdersFromMail(days = 120, limit = 600): Promise<OrderRecord[]> {
    const c = imapConfig();
    if (!mailboxConfigured()) throw new Error("No mailbox configured (IMAP_* or SMTP_* env vars).");
    const client = new ImapFlow({ host: c.host, port: c.port, secure: process.env.IMAP_SECURE !== "false", auth: { user: c.user, pass: c.pass }, logger: false });
    await client.connect();
    try {
        // Gmail keeps mail sent to yourself in "All Mail"; elsewhere the owner copy lands in the inbox.
        const boxes = process.env.IMAP_MAILBOX ? [process.env.IMAP_MAILBOX] : c.gmail ? ["[Gmail]/All Mail", "INBOX"] : ["INBOX"];
        let lock = null;
        for (const box of boxes) {
            try { lock = await client.getMailboxLock(box); break; } catch { /* try the next one */ }
        }
        if (!lock) throw new Error(`Couldn't open mailbox ${boxes.join(" / ")}.`);
        try {
            const since = new Date(Date.now() - days * 864e5);
            const uids = (await client.search(
                c.gmail ? { gmraw: `filename:${FILENAME} newer_than:${days}d` } : { since, header: { [HEADER.toLowerCase()]: "v1" } },
                { uid: true },
            )) || [];
            const recent = uids.slice(-limit);
            const byKey = new Map<string, OrderRecord>();
            if (recent.length) {
                for await (const msg of client.fetch(recent, { source: true }, { uid: true })) {
                    if (!msg.source) continue;
                    const rec = await parseOrderEmail(msg.source);
                    if (rec) byKey.set(rec.key, rec); // later emails (e.g. a re-sent alert) replace earlier ones
                }
            }
            return [...byKey.values()].sort((a, b) => b.created_at.localeCompare(a.created_at));
        } finally {
            lock.release();
        }
    } finally {
        await client.logout().catch(() => client.close());
    }
}

// Row shapes the admin panel shows (same columns as the orders / shop_orders tables).
export function boatRow(r: OrderRecord) {
    return {
        ride_id: r.key, ride_date: r.ride_date ?? null, time_of_day: r.time_of_day ?? "", ghat: r.ghat ?? "",
        package_id: r.product === "custom-boat" ? "" : r.product, boat_type: "Private",
        passenger_name: r.name, passenger_phone: r.phone, passenger_email: r.email, passengers_count: r.guests ?? 1,
        customer_email: r.customer_email ?? null, amount: r.amount, credits_used: r.credits_used, coupon: r.coupon,
        payment_mode: r.payment_mode, payment_status: r.payment_status, razorpay_payment_id: r.payment_ref || null,
        custom_details: r.custom ?? null, check_notes: r.notes || null, created_at: r.created_at,
    };
}

export function shopRow(r: OrderRecord) {
    return {
        order_ref: r.key, product: r.product, customer_email: r.customer_email ?? null, name: r.name || null, phone: r.phone || null,
        provider: r.payment_mode, amount_inr: r.amount, amount_usd: r.amount_usd ?? null, credits_used: r.credits_used,
        coupon: r.coupon, created_at: r.created_at,
    };
}

// The "alternative trigger": copy email orders the database is missing into Supabase. Returns how many were added.
export async function syncOrdersToDb(records: OrderRecord[]): Promise<{ added: number; error?: string }> {
    if (!hasServiceRole() || !records.length) return { added: 0 };
    const db = supabaseAdmin();
    let added = 0;
    try {
        const boats = records.filter((r) => r.kind === "boat");
        if (boats.length) {
            const { data, error } = await db.from("orders").select("ride_id").in("ride_id", boats.map((b) => b.key));
            if (error) return { added, error: error.message };
            const have = new Set((data ?? []).map((d) => d.ride_id));
            const missing = boats.filter((b) => !have.has(b.key)).map(boatRow);
            for (const row of missing) {
                // The columns every orders table has; the rest came with later migrations.
                const core = {
                    ride_id: row.ride_id, ghat: row.ghat, time_of_day: row.time_of_day, boat_type: row.boat_type, package_id: row.package_id,
                    passenger_name: row.passenger_name, passenger_phone: row.passenger_phone, passenger_email: row.passenger_email,
                    passengers_count: row.passengers_count, amount: row.amount, payment_mode: row.payment_mode,
                    payment_status: row.payment_status, razorpay_payment_id: row.razorpay_payment_id,
                };
                const full = {
                    ...core, ride_date: row.ride_date, custom_details: row.custom_details, coupon: row.coupon,
                    customer_email: row.customer_email, credits_used: row.credits_used,
                    check_notes: [row.check_notes, "Restored from the order email."].filter(Boolean).join(" | "),
                };
                let { error: insErr } = await db.from("orders").insert(full);
                // Tables without the newer columns: save the core, with the date folded into the time.
                if (insErr && (insErr.code === "PGRST204" || insErr.code === "42703")) {
                    ({ error: insErr } = await db.from("orders").insert({ ...core, time_of_day: `${row.ride_date ?? ""} · ${row.time_of_day}` }));
                }
                if (insErr && insErr.code !== "23505") return { added, error: insErr.message };
                if (!insErr) added++;
            }
        }
        const shop = records.filter((r) => r.kind === "shop" && r.payment_status === "paid").map(shopRow);
        if (shop.length) {
            const { data, error } = await db.from("shop_orders").upsert(shop, { onConflict: "order_ref", ignoreDuplicates: true }).select("order_ref");
            if (error) return { added, error: error.message };
            added += data?.length ?? 0;
        }
    } catch (e) {
        return { added, error: e instanceof Error ? e.message : String(e) };
    }
    return { added };
}
