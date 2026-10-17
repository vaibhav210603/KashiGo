import { NextResponse } from "next/server";
import { rateLimited } from "@/lib/rateLimit";
import { fetchOrdersFromMail, mailboxConfigured, syncOrdersToDb } from "@/lib/orderMail";
import { hasServiceRole, supabaseAdmin } from "@/lib/supabaseAdmin";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Daily (vercel.json): copies the last few days of order emails into Supabase if any are missing,
// and runs a real query either way so the free-tier project never pauses for inactivity.
// Vercel sends "Authorization: Bearer $CRON_SECRET" when CRON_SECRET is set.
export async function GET(req: Request) {
    const secret = process.env.CRON_SECRET;
    if (secret ? req.headers.get("authorization") !== `Bearer ${secret}` : rateLimited(req, "cron-sync", 3, 60 * 60 * 1000)) {
        return NextResponse.json({ error: "Not authorised." }, { status: 401 });
    }

    let db: string = "not configured";
    if (hasServiceRole()) {
        const { error } = await supabaseAdmin().from("orders").select("ride_id", { count: "exact", head: true });
        db = error ? `error: ${error.message}` : "ok";
    }

    let mail: string = "not configured";
    let synced = 0;
    if (mailboxConfigured()) {
        try {
            const records = await fetchOrdersFromMail(4);
            const res = db === "ok" ? await syncOrdersToDb(records) : { added: 0, error: "database unavailable" };
            synced = res.added;
            mail = res.error ? `${records.length} order emails; sync error: ${res.error}` : `${records.length} order emails`;
        } catch (e) {
            mail = `error: ${e instanceof Error ? e.message : String(e)}`;
        }
    }
    return NextResponse.json({ ok: true, db, mail, synced, at: new Date().toISOString() });
}
