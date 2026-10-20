// Custom quotations sent to individual customers, each paid from its own page at /quote/<id>.
// The amount charged is always read from here on the server — never from the browser.

export type QuoteLine = { label: string; detail: string; amountInr: number };

export type Quote = {
    id: string;          // URL slug and quotation number
    issued: string;      // ISO date
    validUntil: string;  // shown to the customer; payment closes after the ride starts
    customer: { name: string };
    ride: {
        title: string;
        ghat: string;
        date: string;        // ISO date of the journey
        aartiTime: string;
        reportTime: string;
        route: string;
    };
    itinerary: { time: string; what: string }[];
    lines: QuoteLine[];
};

export const QUOTES: Record<string, Quote> = {
    "KG-Q-261021-KJ": {
        id: "KG-Q-261021-KJ",
        issued: "2026-10-20",
        validUntil: "21 Oct 2026, 4:00 AM IST",
        customer: { name: "KrishnaKant Joshi" },
        ride: {
            title: "Sunrise Aarti Boat Ride",
            ghat: "Assi Ghat",
            date: "2026-10-21",
            aartiTime: "5:00 AM",
            reportTime: "4:30 AM",
            route: "Assi Ghat → along the ghats → back to Assi Ghat",
        },
        itinerary: [
            { time: "4:30 AM", what: "Report at Assi Ghat — sharp. Your KashiGo boatman meets you at the steps." },
            { time: "4:45 AM", what: "Board the boat, life jackets on, settle in for the best view." },
            { time: "5:00 AM", what: "Subah-e-Banaras Ganga Aarti, watched from the river." },
            { time: "~6:00 AM", what: "Sunrise over the Ganga as we row along the ghats." },
            { time: "After sunrise", what: "Return journey to Assi Ghat." },
        ],
        lines: [
            { label: "Sunrise Aarti Boat Ride", detail: "Assi Ghat · one way · private boat with boatman", amountInr: 1660 },
            { label: "Return journey to Assi Ghat", detail: "50% of the journey fare", amountInr: 830 },
        ],
    },
};

export const getQuote = (id: string): Quote | null => QUOTES[id] ?? null;
export const quoteTotal = (q: Quote) => q.lines.reduce((s, l) => s + l.amountInr, 0);
// Razorpay receipts are capped at 40 characters; this one ties every order back to its quote.
export const quoteReceipt = (q: Quote) => `quote_${q.id}`.slice(0, 40);
