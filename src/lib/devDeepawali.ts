// Dev Deepawali 2026 shared boat ride, shown on the home page (invitation banner + section).
// Booked on WhatsApp: we confirm the seats and send a payment link (a quotation, see /admin).
import { DEV_DEEPAWALI_DAY, addDaysIso } from "@/lib/boatRides";

export const DEV_DEEPAWALI_DATE = DEV_DEEPAWALI_DAY; // Kartik Purnima, Tuesday 24 November 2026
export const DEV_DEEPAWALI_LABEL = "Tue 24 Nov";
// The ghats are lit from dusk.
export const LIGHTING_AT = Date.parse("2026-11-24T17:15:00+05:30");

// Per-passenger price on a shared boat. Reset to ₹5,499 on 8 Nov and rises ₹200 every 2 days until the festival,
// so booking early is always cheapest.
export const SEAT_PRICE_START_INR = 5499;
// What local boatmen ask per person on the ghat that night — shown struck through next to our price.
// Keep it above the last day's price (₹5,499 + 8 rises × ₹200 = ₹7,099).
export const GHAT_PRICE_INR = 8999;
export const SEAT_PRICE_FROM = "2026-11-08";
export const HIKE_INR = 200;
export const HIKE_EVERY_DAYS = 2;
export const BEST_PRICE_LINE = "Best prices and 100% money-back guarantee";

// Early-bird offer (from 14 Nov 2026): ₹3,699 a seat for the first 20 passengers on our boat, the regular price
// struck through next to it. Update EARLY_BIRD_TAKEN as seats go; at 20 the offer closes by itself and the
// regular price ladder below comes back.
export const EARLY_BIRD_INR = 3699;
export const EARLY_BIRD_SEATS = 20;
export const EARLY_BIRD_TAKEN = 8; // 12 left (set 15 Nov 2026)
export const EARLY_BIRD_LEFT = Math.max(0, EARLY_BIRD_SEATS - EARLY_BIRD_TAKEN);
export const EARLY_BIRD_OPEN = EARLY_BIRD_LEFT > 0;

const daysBetween = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);

// Regular seat price on a given India date (YYYY-MM-DD), ignoring the early-bird offer.
export function regularPriceOn(iso: string): number {
    const last = iso > DEV_DEEPAWALI_DATE ? DEV_DEEPAWALI_DATE : iso;
    return SEAT_PRICE_START_INR + Math.floor(Math.max(0, daysBetween(SEAT_PRICE_FROM, last)) / HIKE_EVERY_DAYS) * HIKE_INR;
}

// What a seat costs today: the early-bird price while those seats last, else the regular price.
export const seatPriceOn = (iso: string): number => (EARLY_BIRD_OPEN ? EARLY_BIRD_INR : regularPriceOn(iso));

// Today's price, then the next few price rises (each with the date it starts and how many days away that is).
// During the early-bird offer it's just today's price, with `was` = the regular price to strike through.
export function seatPrices(todayIso: string, steps = 3): { iso: string; inDays: number; inr: number; was?: number }[] {
    if (EARLY_BIRD_OPEN) return [{ iso: todayIso, inDays: 0, inr: EARLY_BIRD_INR, was: regularPriceOn(todayIso) }];
    const out: { iso: string; inDays: number; inr: number; was?: number }[] = [{ iso: todayIso, inDays: 0, inr: seatPriceOn(todayIso) }];
    for (let d = 1; out.length < steps; d++) {
        const iso = addDaysIso(todayIso, d);
        if (iso > DEV_DEEPAWALI_DATE) break;
        const inr = regularPriceOn(iso);
        if (inr !== out[out.length - 1].inr) out.push({ iso, inDays: d, inr });
    }
    return out;
}

// Seat packs, priced so a pair looks at the trio: Solo is one seat, Pair is exactly two seats (no discount),
// and Trio adds a third seat for only ₹2,001 more than the Pair — so the Pair is the one nobody picks.
// Bigger groups pay the Trio price for every 3 seats and the seat price for the rest; the server prices the same way.
export const THIRD_SEAT_INR = 2001;
export const trioPrice = (seat: number) => seat * 2 + THIRD_SEAT_INR;
export function ddTotal(seat: number, people: number): number {
    const n = Math.max(0, Math.trunc(people));
    return Math.floor(n / 3) * trioPrice(seat) + (n % 3) * seat;
}
export const DD_PACKS = [
    { people: 1, name: "Solo", line: "1 seat" },
    { people: 2, name: "Pair", line: "2 seats" },
    { people: 3, name: "Trio", line: "3 seats" },
] as const;

// What every Dev Deepawali seat includes. Boarding ghat and time are confirmed on a call after booking.
export const AMENITIES: { title: string; short: string; detail: string }[] = [
    { title: "Your seat on a KashiGo boat", short: "Your seat", detail: "A reserved seat on our shared boat for Dev Deepawali night, in your name." },
    { title: "Front-row river view", short: "Front-row view", detail: "The lit ghats, the grand aarti and the fireworks over the water — from the Ganga itself." },
    { title: "Life jackets for everyone", short: "Life jackets", detail: "On board for every passenger, the whole evening." },
    { title: "A trusted local boatman", short: "Trusted boatman", detail: "A boatman we work with all year, not a stranger found in the crowd." },
    { title: "Price fixed, paid online", short: "Fixed price", detail: "Nothing to bargain on the night, and no surprise charges at the ghat." },
    { title: "100% money-back guarantee", short: "Money-back guarantee", detail: "If we can't give you the ride you booked, you get every rupee back." },
];

// Pay in full now, or 50% now and the rest to the boatman at the ghat.
export type DdPay = "full" | "advance";
export const ddSplit = (total: number, pay: DdPay) => {
    const online = pay === "advance" ? Math.ceil(total / 2) : total;
    return { online, atGhat: total - online };
};
// One booking can take up to 12 seats; during the offer, no more than the early-bird seats left.
export const DD_MAX_PEOPLE = EARLY_BIRD_OPEN ? Math.min(12, EARLY_BIRD_LEFT) : 12;

export const WHATSAPP = "918175966910";
export const whatsappLink = (people: number, priceInr: number) =>
    `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
        `Namaste KashiGo! I'd like to book the Dev Deepawali shared boat ride (${DEV_DEEPAWALI_LABEL}) for ${people} ${people === 1 ? "person" : "people"} at ₹${priceInr.toLocaleString("en-IN")} per person.`,
    )}`;
