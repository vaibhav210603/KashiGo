import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminApi";
import { istNow, toMinutes } from "@/lib/boatRides";
import { returnFareInr } from "@/lib/boatPrices";
import { priceQuote, quotePackage, quoteTotal, slotFor, startSelection, type Quote, type QuoteAddOn, type QuoteBuilder, type QuotePassenger } from "@/lib/quotes";
import { deleteQuote, listQuotes, quoteIdTaken, saveQuote } from "@/lib/quoteStore";
import { isQuotePaid } from "@/lib/quotePayments";

const text = (v: unknown, max: number) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

// Validates a quotation sent by the admin generator; returns the quote (without its id) or an error.
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- untrusted JSON, every field is checked below
function clean(b: any): { quote?: Omit<Quote, "id">; error?: string } {
    const pkg = quotePackage(String(b?.packageId ?? ""));
    if (!pkg) return { error: "Pick a package." };
    // Lead passenger first; the rest become the passengers the customer starts with on the page (name + age, editable there).
    const raw: { name: string; age: string }[] = (Array.isArray(b.passengers) ? b.passengers : [b.name]).slice(0, 20)
        .map((p: unknown) => (typeof p === "object" && p ? { name: text((p as { name?: unknown }).name, 60), age: text((p as { age?: unknown }).age, 3).replace(/\D/g, "") } : { name: text(p, 60), age: "" }));
    const name = raw[0]?.name || text(b.name, 80);
    if (name.length < 2) return { error: "Enter the lead passenger's name." };
    const initialPassengers: QuotePassenger[] = raw.slice(1).filter((p) => p.name);
    const date = String(b.date ?? "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) return { error: "Pick the ride date." };
    const startTime = text(b.startTime, 12);
    const reportTime = text(b.reportTime, 12);
    if (Number.isNaN(toMinutes(startTime)) || Number.isNaN(toMinutes(reportTime))) return { error: "Times look like 5:30 AM or 17:30." };
    const ghat = text(b.ghat, 60);
    if (!ghat) return { error: "Pick the meeting ghat." };
    const guests = 1 + initialPassengers.length;

    const lines = (Array.isArray(b.lines) ? b.lines : []).slice(0, 12)
        .map((l: { label?: unknown; detail?: unknown; amountInr?: unknown }) => ({ label: text(l?.label, 90), detail: text(l?.detail, 140), amountInr: Math.round(Number(l?.amountInr)) }))
        .filter((l: { label: string }) => l.label);
    if (!lines.length) return { error: "Add at least one line to the quotation." };
    if (lines.some((l: { amountInr: number }) => !Number.isFinite(l.amountInr) || Math.abs(l.amountInr) > 500000)) return { error: "Every line needs an amount in rupees." };
    if (quoteTotal({ lines }) < 1) return { error: "The total must be at least ₹1." };

    // The customer-side checkout (same as the hand-made quotes): extra passengers, extras, coupon and tax.
    const int = (v: unknown, lo: number, hi: number, d: number) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d; };
    const c = b.builder ?? {};
    const addOns: QuoteAddOn[] = (Array.isArray(c.addOns) ? c.addOns : []).slice(0, 8)
        .map((a: { label?: unknown; detail?: unknown; amountInr?: unknown; max?: unknown; perPerson?: unknown }, i: number) => ({
            id: `x${i + 1}`, label: text(a?.label, 60), detail: text(a?.detail, 120), amountInr: int(a?.amountInr, 0, 100000, 0), max: int(a?.max, 1, 50, 10), perPerson: Boolean(a?.perPerson) || undefined,
        }))
        .filter((a: QuoteAddOn) => a.label && a.amountInr > 0);
    const coupons = (Array.isArray(c.coupons) ? c.coupons : []).slice(0, 5)
        .map((x: { code?: unknown; percentOff?: unknown }) => ({ code: text(x?.code, 30).toUpperCase().replace(/[^A-Z0-9_-]/g, ""), percentOff: int(x?.percentOff, 1, 90, 0) }))
        .filter((x: { code: string; percentOff: number }) => x.code.length >= 3 && x.percentOff > 0);
    const builder: QuoteBuilder = {
        perPassengerInr: int(c.perPassengerInr, 0, 100000, 0),
        maxPassengers: int(c.maxPassengers, Math.max(1, initialPassengers.length), 30, 15),
        returnTrip: c.offerReturn ? { label: `Return journey to ${ghat}`, detail: "50% of the journey fare", amountInr: returnFareInr(lines[0].amountInr) } : undefined,
        addOns,
        taxInr: int(c.taxInr, 0, 100000, 0),
        coupons: coupons.length ? coupons : undefined,
        kidsUnder6: true,
        initialPassengers,
    };
    if (priceQuote({ lines, builder }, startSelection({ builder })).total < 1) return { error: "The total must be at least ₹1." };

    const itinerary = (Array.isArray(b.itinerary) ? b.itinerary : []).slice(0, 15)
        .map((s: { time?: unknown; what?: unknown }) => ({ time: text(s?.time, 30), what: text(s?.what, 200) }))
        .filter((s: { what: string }) => s.what);

    return {
        quote: {
            issued: istNow().iso,
            validUntil: text(b.validUntil, 60) || date,
            customer: { name, phone: text(b.phone, 20) || undefined, email: text(b.email, 120).toLowerCase() || undefined },
            ride: {
                packageId: pkg.id,
                title: text(b.title, 80) || pkg.title,
                ghat,
                date,
                dateLabel: b.dateTbc ? "To be confirmed with you" : undefined,
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
            payment: b.payment === "advance50" ? "advance50" : "online",
            itinerary,
            lines,
            builder,
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
        return NextResponse.json({ quotes: rows.map((r, i) => ({ ...r, total: priceQuote(r.quote, startSelection(r.quote)).total, paid: paid[i] })) });
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
