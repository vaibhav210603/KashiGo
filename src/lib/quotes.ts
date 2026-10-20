// Custom quotations sent to individual customers, each paid from its own page at /quote/<id>.
// Quotes are made in /admin → Quotes and stored in Supabase (lib/quoteStore.ts); the one below predates that.
// The amount charged is always read on the server — never from the browser.
// Safe to import from client components: the admin generator uses the package templates here.
import { BOAT_RIDES, CUSTOM_RIDE, toMinutes } from "@/lib/boatRides";
import { BOAT_PRICES_INR, returnFareInr } from "@/lib/boatPrices";

export type QuoteLine = { label: string; detail: string; amountInr: number };
export type Slot = "Morning" | "Afternoon" | "Evening";

export type Quote = {
    id: string;          // URL slug and quotation number
    issued: string;      // ISO date
    validUntil: string;  // shown to the customer
    customer: { name: string; phone?: string; email?: string }; // the lead passenger — the name on top of the quotation
    passengers?: (string | QuoteTraveller)[]; // everyone travelling, lead passenger first (plain names on older quotes)
    ride: {
        packageId: string;   // p1–p6 or "custom"
        title: string;
        ghat: string;
        date: string;        // ISO date of the journey
        startLabel: string;  // "Aarti begins" / "Ride starts"
        startTime: string;
        reportTime: string;
        route: string;
        guests?: number;
        image: string;
        slot: Slot;
    };
    intro: string;       // the paragraph after "Namaste <name> ji, thank you for choosing KashiGo."
    note?: string;       // optional extra note shown to the customer
    itinerary: { time: string; what: string }[];
    lines: QuoteLine[];
    builder?: QuoteBuilder; // lets the customer shape the quote on the page before paying
};

// A passenger on an admin-made quote. Children under 6 ride free and pay only for their life jacket.
export type QuoteTraveller = { name: string; child?: boolean };
export const CHILD_FREE_UNDER = 6;
export const CHILD_JACKET_INR = 150;
export const travellersOf = (q: Pick<Quote, "passengers">): QuoteTraveller[] => (q.passengers ?? []).map((p) => (typeof p === "string" ? { name: p } : p));

export type QuoteAddOn = { id: string; label: string; detail: string; amountInr: number; max: number };

// Optional extras the customer picks on the quotation page. `lines` stay fixed; these are added on top, then tax.
export type QuoteBuilder = {
    returnTrip?: QuoteLine;      // a checkbox, unticked by default
    perPassengerInr: number;     // for each passenger added beyond the lead passenger
    maxPassengers: number;       // extra passengers allowed
    addOns: QuoteAddOn[];
    taxInr: number;              // flat, charged once
};

export type QuotePassenger = { name: string; age: string };
export type QuoteSelection = { returnTrip: boolean; passengers: QuotePassenger[]; addOns: Record<string, number> };

export const emptySelection = (): QuoteSelection => ({ returnTrip: false, passengers: [], addOns: {} });

// Cleans whatever the browser sent down to what the quote allows. Used on both sides, so the page and the charge always agree.
export function cleanSelection(q: Pick<Quote, "builder">, raw: unknown): QuoteSelection {
    const b = q.builder;
    const r = (raw ?? {}) as Partial<QuoteSelection>;
    if (!b) return emptySelection();
    const text = (v: unknown, max: number) => String(v ?? "").replace(/[\u0000-\u001f\u007f<>]/g, "").trim().slice(0, max);
    const passengers = (Array.isArray(r.passengers) ? r.passengers : [])
        .slice(0, b.maxPassengers)
        .map((p) => ({ name: text(p?.name, 60), age: text(p?.age, 3).replace(/\D/g, "") }));
    const addOns: Record<string, number> = {};
    for (const a of b.addOns) {
        const n = Math.trunc(Number(r.addOns?.[a.id] ?? 0));
        if (n > 0) addOns[a.id] = Math.min(n, a.max);
    }
    return { returnTrip: Boolean(b.returnTrip && r.returnTrip), passengers, addOns };
}

// Every line on the bill for a selection, tax last.
export function priceQuote(q: Pick<Quote, "lines" | "builder">, sel: QuoteSelection): { lines: QuoteLine[]; total: number } {
    const b = q.builder;
    const lines = [...q.lines];
    if (b) {
        if (sel.returnTrip && b.returnTrip) lines.push(b.returnTrip);
        const named = sel.passengers.filter((p) => p.name);
        if (named.length) {
            lines.push({
                label: `Additional passenger${named.length === 1 ? "" : "s"} × ${named.length}`,
                detail: `${named.map((p) => (p.age ? `${p.name} (${p.age})` : p.name)).join(", ")} · ₹${b.perPassengerInr} each`,
                amountInr: named.length * b.perPassengerInr,
            });
        }
        for (const a of b.addOns) {
            const n = sel.addOns[a.id] ?? 0;
            if (n > 0) lines.push({ label: `${a.label} × ${n}`, detail: a.detail, amountInr: n * a.amountInr });
        }
        if (b.taxInr) lines.push({ label: "Taxes", detail: "Applicable taxes & charges", amountInr: b.taxInr });
    }
    return { lines, total: lines.reduce((s, l) => s + l.amountInr, 0) };
}

// One line for Razorpay notes and emails: what the customer chose.
export function describeSelection(q: Pick<Quote, "builder">, sel: QuoteSelection): string {
    const b = q.builder;
    if (!b) return "";
    const named = sel.passengers.filter((p) => p.name);
    const parts = [
        b.returnTrip ? `Return: ${sel.returnTrip ? "yes" : "no"}` : "",
        named.length ? `Extra passengers: ${named.map((p) => (p.age ? `${p.name} (${p.age})` : p.name)).join(", ")}` : "Extra passengers: none",
        ...b.addOns.filter((a) => sel.addOns[a.id]).map((a) => `${a.label} ×${sel.addOns[a.id]}`),
    ];
    return parts.filter(Boolean).join(" | ");
}

export const STATIC_QUOTES: Record<string, Quote> = {
    "KG-Q-261021-KJ": {
        id: "KG-Q-261021-KJ",
        issued: "2026-10-20",
        validUntil: "21 Oct 2026, 4:00 AM IST",
        customer: { name: "KrishnaKant Joshi" },
        ride: {
            packageId: "p2",
            title: "Sunrise Aarti Boat Ride",
            ghat: "Assi Ghat",
            date: "2026-10-21",
            startLabel: "Aarti begins",
            startTime: "5:00 AM",
            reportTime: "4:30 AM",
            route: "Assi Ghat → along the ghats",
            image: "/m_aarti_bg.png",
            slot: "Morning",
        },
        intro: "Here is your quotation for a private sunrise boat to the Subah-e-Banaras Ganga Aarti — one of the most peaceful hours you will spend on the Ganga.",
        itinerary: [
            { time: "4:30 AM", what: "Report at Assi Ghat — sharp. Your KashiGo boatman meets you at the steps." },
            { time: "4:45 AM", what: "Board the boat, life jackets on, settle in for the best view." },
            { time: "5:00 AM", what: "Subah-e-Banaras Ganga Aarti, watched from the river." },
            { time: "~6:00 AM", what: "Sunrise over the Ganga as we row along the ghats." },
            { time: "After sunrise", what: "Ride ends — or row back to Assi Ghat if you add the return journey." },
        ],
        lines: [
            { label: "Sunrise Aarti Boat Ride", detail: "Assi Ghat · one way · private boat with boatman · lead passenger included", amountInr: 1660 },
        ],
        builder: {
            returnTrip: { label: "Return journey to Assi Ghat", detail: "50% of the journey fare", amountInr: 830 },
            perPassengerInr: 450,
            maxPassengers: 15,
            addOns: [
                { id: "bird-feed", label: "Bird feeder pack", detail: "2 sachets of bird feed for the gulls", amountInr: 50, max: 10 },
            ],
            taxInr: 150,
        },
    },
};

export const quoteTotal = (q: Pick<Quote, "lines">) => q.lines.reduce((s, l) => s + l.amountInr, 0);
// Razorpay receipts are capped at 40 characters; this one ties every order back to its quote.
export const quoteReceipt = (q: Pick<Quote, "id">) => `quote_${q.id}`.slice(0, 40);

/* ───────────── Package templates for the admin generator ───────────── */

type Step = [offsetMin: number | null, label: string | null, what: string]; // null offset = untimed (uses label)

export type QuotePackage = {
    id: string;
    name: string;        // admin dropdown
    title: string;       // shown on the quotation
    priceInr: number;    // one-way ride price; the return journey is added on top
    time: string;        // default start
    ghat: string;        // default meeting ghat
    image: string;
    slot: Slot;
    startLabel: string;
    aarti: boolean;
    intro: string;
    steps: Step[];
};

const ride = (id: keyof typeof BOAT_PRICES_INR) => BOAT_RIDES.find((r) => r.id === id)!;

export const QUOTE_PACKAGES: QuotePackage[] = [
    {
        id: "p5", name: ride("p5").name, title: "Evening Ganga Aarti Boat Ride", priceInr: BOAT_PRICES_INR.p5, time: ride("p5").time,
        ghat: "Dashashwamedh Ghat", image: ride("p5").image, slot: "Evening", startLabel: "Ride starts", aarti: true,
        intro: "Here is your quotation for a private boat to the evening Ganga Aarti at Dashashwamedh — the fire ceremony, seen front-row from the river.",
        steps: [[0, null, "Boat leaves the ghat — row along the ghats as the evening lamps are lit."], [15, null, "Boat anchors in front of Dashashwamedh Ghat for the Ganga Aarti."], [null, "After the Aarti", "Return journey to {ghat}."]],
    },
    {
        id: "p1", name: ride("p1").name, title: "Sunrise Boat Ride + Bird Feeding", priceInr: BOAT_PRICES_INR.p1, time: ride("p1").time,
        ghat: "Dashashwamedh Ghat", image: ride("p1").image, slot: "Morning", startLabel: "Ride starts", aarti: false,
        intro: "Here is your quotation for a private sunrise boat on the Ganga — Varanasi waking up, morning rituals along the ghats and the gulls over the water.",
        steps: [[0, null, "Boat leaves as the sky lightens over the river."], [30, "~", "Sunrise over the Ganga; morning rituals along the main ghats."], [60, "~", "Bird feeding — Siberian gulls in the winter months."], [null, "After the ride", "Return journey to {ghat}."]],
    },
    {
        id: "p6", name: ride("p6").name, title: "Sunset Boat Ride", priceInr: BOAT_PRICES_INR.p6, time: ride("p6").time,
        ghat: "Dashashwamedh Ghat", image: ride("p6").image, slot: "Evening", startLabel: "Ride starts", aarti: false,
        intro: "Here is your quotation for a private sunset boat on the Ganga — golden hour past the old ghats of Kashi.",
        steps: [[0, null, "Boat leaves for a golden-hour ride past the old ghats."], [45, "~", "Sunset over the Ganga."], [null, "After sunset", "Return journey to {ghat}."]],
    },
    {
        id: "p2", name: ride("p2").name, title: "Sunrise Aarti Boat Ride", priceInr: BOAT_PRICES_INR.p2, time: "5:00 AM",
        ghat: "Assi Ghat", image: ride("p2").image, slot: "Morning", startLabel: "Aarti begins", aarti: true,
        intro: "Here is your quotation for a private sunrise boat to the Subah-e-Banaras Ganga Aarti — one of the most peaceful hours you will spend on the Ganga.",
        steps: [[0, null, "Subah-e-Banaras Ganga Aarti, watched from the river."], [60, "~", "Sunrise over the Ganga as we row along the ghats."], [null, "After sunrise", "Return journey to {ghat}."]],
    },
    {
        id: "p3", name: ride("p3").name, title: "Day Ghat Tour", priceInr: BOAT_PRICES_INR.p3, time: ride("p3").time,
        ghat: "Dashashwamedh Ghat", image: ride("p3").image, slot: "Afternoon", startLabel: "Ride starts", aarti: false,
        intro: "Here is your quotation for a private daylight boat past the great ghats of Varanasi, with the stories behind each one.",
        steps: [[0, null, "Boat leaves — the major ghats and the stories behind each one."], [45, "~", "Manikarnika and Harishchandra ghats, seen from the water."], [null, "After the tour", "Return journey to {ghat}."]],
    },
    {
        id: "p4", name: ride("p4").name, title: "Temple + Boat Tour", priceInr: BOAT_PRICES_INR.p4, time: ride("p4").time,
        ghat: "Dashashwamedh Ghat", image: ride("p4").image, slot: "Afternoon", startLabel: "Ride starts", aarti: false,
        intro: "Here is your quotation for a private boat ride combined with a walk to the key temples of the old city.",
        steps: [[0, null, "Boat ride along the ghats."], [60, "~", "Step ashore for a guided walk to the key temples of the old city."], [null, "After the walk", "Return journey to {ghat}."]],
    },
    {
        id: "custom", name: CUSTOM_RIDE.name, title: "Private Boat Ride", priceInr: BOAT_PRICES_INR.custom, time: "6:00 AM",
        ghat: "Dashashwamedh Ghat", image: CUSTOM_RIDE.image, slot: "Morning", startLabel: "Ride starts", aarti: false,
        intro: "Here is your quotation for a private boat on the Ganga — your route, at your time.",
        steps: [[0, null, "Your private ride begins on the route we agreed."], [null, "End of the ride", "Back to {ghat}."]],
    },
];

export const quotePackage = (id: string) => QUOTE_PACKAGES.find((p) => p.id === id) ?? null;

// "17:30" / "5:30 PM" + minutes → "6:00 PM"
export function shiftTime(time: string, deltaMin: number): string {
    const m = toMinutes(time);
    if (Number.isNaN(m)) return time;
    const t = (((m + deltaMin) % 1440) + 1440) % 1440;
    const h = Math.floor(t / 60);
    return `${h % 12 || 12}:${String(t % 60).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export function slotFor(time: string): Slot {
    const m = toMinutes(time);
    return m < 11 * 60 ? "Morning" : m < 16 * 60 ? "Afternoon" : "Evening";
}

export function defaultItinerary(p: QuotePackage, ghat: string, startTime: string, reportTime: string) {
    const fill = (s: string) => s.replaceAll("{ghat}", ghat);
    return [
        { time: reportTime, what: `Report at ${ghat} — sharp. Your KashiGo boatman meets you at the steps.` },
        { time: shiftTime(startTime, -15), what: "Board the boat, life jackets on, settle in for the best view." },
        ...p.steps.map(([off, label, what]) => ({ time: off === null ? label! : `${label ?? ""}${shiftTime(startTime, off)}`, what: fill(what) })),
    ];
}

export function defaultLines(p: QuotePackage, ghat: string, priceInr: number, guests: number, withReturn: boolean): QuoteLine[] {
    const people = guests > 0 ? ` · ${guests} passenger${guests === 1 ? "" : "s"}` : "";
    const lines: QuoteLine[] = [{ label: p.title, detail: `${ghat} · ${withReturn ? "one way" : "private ride"} · private boat with boatman${people}`, amountInr: priceInr }];
    if (withReturn) lines.push({ label: `Return journey to ${ghat}`, detail: "50% of the journey fare", amountInr: returnFareInr(priceInr) });
    return lines;
}

// The admin generator's bill. "boat": one price for the boat; "passenger": a price per adult (life jacket included).
// Either way each child under 6 rides free and pays CHILD_JACKET_INR for a life jacket.
export function passengerLines(opts: {
    pkg: QuotePackage; ghat: string; mode: "boat" | "passenger"; boatPriceInr: number; withReturn: boolean;
    people: { name: string; child: boolean; priceInr: number }[];
}): QuoteLine[] {
    const { pkg, ghat, mode, boatPriceInr, withReturn, people } = opts;
    const kids = people.filter((p) => p.child);
    const kidNote = kids.length ? ` (${kids.length} under ${CHILD_FREE_UNDER})` : "";
    const jacket = (p: { name: string }, i: number) => ({ label: `${p.name || `Child ${i + 1}`} — child under ${CHILD_FREE_UNDER}`, detail: `Rides free · life jacket only`, amountInr: CHILD_JACKET_INR });
    if (mode === "boat") {
        const lines = defaultLines(pkg, ghat, boatPriceInr, 0, withReturn);
        lines[0] = { ...lines[0], detail: `${lines[0].detail} · ${people.length} passenger${people.length === 1 ? "" : "s"}${kidNote}` };
        return [...lines, ...kids.map(jacket)];
    }
    const adults = people.filter((p) => !p.child);
    const adultSum = adults.reduce((s, p) => s + p.priceInr, 0);
    const lines: QuoteLine[] = adults.map((p, i) => ({ label: p.name || `Passenger ${i + 1}`, detail: `Adult · ${pkg.title} · life jacket included`, amountInr: p.priceInr }));
    if (withReturn && adultSum > 0) lines.push({ label: `Return journey to ${ghat}`, detail: "50% of the adult fares", amountInr: returnFareInr(adultSum) });
    return [...lines, ...kids.map(jacket)];
}

export const defaultRoute = (ghat: string) => `${ghat} → along the ghats → back to ${ghat}`;

export function defaultValidUntil(dateIso: string, startTime: string): string {
    const d = new Date(`${dateIso}T00:00:00+05:30`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
    return `${d}, ${shiftTime(startTime, -60)} IST`;
}
