import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminApi";
import { istNow, toMinutes } from "@/lib/boatRides";
import { quotePackage, quoteTotal, slotFor, type Quote } from "@/lib/quotes";
import { deleteQuote, listQuotes, quoteIdTaken, saveQuote } from "@/lib/quoteStore";
import { isQuotePaid } from "@/lib/quotePayments";

const text = (v: unknown, max: number) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

// Validates a quotation sent by the admin generator; returns the quote (without its id) or an error.
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- untrusted JSON, every field is checked below
function clean(b: any): { quote?: Omit<Quote, "id">; error?: string } {
    const pkg = quotePackage(String(b?.packageId ?? ""));
    if (!pkg) return { error: "Pick a package." };
    // Lead passenger first; blank names further down are kept as "Guest N" so the head count stays right.
    const named = (Array.isArray(b.passengers) ? b.passengers : [b.name]).slice(0, 20).map((p: unknown) => text(p, 80));
    const name = named[0] || text(b.name, 80);
    if (name.length < 2) return { error: "Enter the lead passenger's name." };
    const passengers = [name, ...named.slice(1).map((p: string, i: number) => p || `Guest ${i + 2}`)];
    const date = String(b.date ?? "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) return { error: "Pick the ride date." };
    const startTime = text(b.startTime, 12);
    const reportTime = text(b.reportTime, 12);
    if (Number.isNaN(toMinutes(startTime)) || Number.isNaN(toMinutes(reportTime))) return { error: "Times look like 5:30 AM or 17:30." };
    const ghat = text(b.ghat, 60);
    if (!ghat) return { error: "Pick the meeting ghat." };
    const guests = Math.max(passengers.length, Math.min(99, Math.floor(Number(b.guests) || 0)));

    const lines = (Array.isArray(b.lines) ? b.lines : []).slice(0, 12)
        .map((l: { label?: unknown; detail?: unknown; amountInr?: unknown }) => ({ label: text(l?.label, 90), detail: text(l?.detail, 140), amountInr: Math.round(Number(l?.amountInr)) }))
        .filter((l: { label: string }) => l.label);
    if (!lines.length) return { error: "Add at least one line to the quotation." };
    if (lines.some((l: { amountInr: number }) => !Number.isFinite(l.amountInr) || Math.abs(l.amountInr) > 500000)) return { error: "Every line needs an amount in rupees." };
    const total = quoteTotal({ lines });
    if (total < 1) return { error: "The total must be at least ₹1." };

    const itinerary = (Array.isArray(b.itinerary) ? b.itinerary : []).slice(0, 15)
        .map((s: { time?: unknown; what?: unknown }) => ({ time: text(s?.time, 30), what: text(s?.what, 200) }))
        .filter((s: { what: string }) => s.what);

    return {
        quote: {
            issued: istNow().iso,
            validUntil: text(b.validUntil, 60) || date,
            passengers,
            customer: { name, phone: text(b.phone, 20) || undefined, email: text(b.email, 120).toLowerCase() || undefined },
            ride: {
                packageId: pkg.id,
                title: text(b.title, 80) || pkg.title,
                ghat,
                date,
                startLabel: pkg.startLabel,
                startTime,
                reportTime,
                route: text(b.route, 160) || `${ghat} → along the ghats → back to ${ghat}`,
                guests: guests || undefined,
                image: pkg.image,
                slot: pkg.id === "custom" ? slotFor(startTime) : pkg.slot,
            },
            intro: text(b.intro, 400) || pkg.intro,
            note: String(b.note ?? "").trim().slice(0, 600) || undefined,
            itinerary,
            lines,
        },
    };
}

// KG-Q-<ride date as YYMMDD>-<initials>, e.g. KG-Q-261021-KJ; a number is added if that's taken.
async function newId(name: string, date: string): Promise<string> {
    const words = name.toUpperCase().replace(/[^A-Z ]/g, "").split(" ").filter(Boolean);
    const initials = words.length ? (words[0][0] + (words.length > 1 ? words[words.length - 1][0] : words[0][1] ?? "")) : "XX";
    const base = `KG-Q-${date.slice(2).replaceAll("-", "")}-${initials}`;
    for (let n = 1; n < 50; n++) {
        const id = n === 1 ? base : `${base}${n}`;
        if (!(await quoteIdTaken(id))) return id;
    }
    return `${base}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
}

export async function GET(req: Request) {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    try {
        const rows = await listQuotes();
        // Razorpay is the source of truth for payment; only quotes not yet marked paid are checked.
        const paid = await Promise.all(rows.map((r) => (r.paidAt ? true : isQuotePaid(r.quote))));
        return NextResponse.json({ quotes: rows.map((r, i) => ({ ...r, total: quoteTotal(r.quote), paid: paid[i] })) });
    } catch (e) {
        return NextResponse.json({ quotes: [], error: (e as Error).message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    const { quote, error } = clean(await req.json().catch(() => ({})));
    if (!quote) return NextResponse.json({ error }, { status: 400 });
    try {
        const full: Quote = { id: await newId(quote.customer.name, quote.ride.date), ...quote };
        await saveQuote(full, admin.email);
        return NextResponse.json({ quote: full });
    } catch (e) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    const id = String(new URL(req.url).searchParams.get("id") || "");
    try {
        await deleteQuote(id);
        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json({ error: (e as Error).message }, { status: 400 });
    }
}
