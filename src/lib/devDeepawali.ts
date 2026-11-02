// Dev Deepawali 2026 shared boat ride, shown on the home page (invitation banner + section).
// Booked on WhatsApp: we confirm the seats and send a payment link (a quotation, see /admin).
import { DEV_DEEPAWALI_DAY, addDaysIso } from "@/lib/boatRides";

export const DEV_DEEPAWALI_DATE = DEV_DEEPAWALI_DAY; // Kartik Purnima, Tuesday 24 November 2026
export const DEV_DEEPAWALI_LABEL = "Tue 24 Nov";
// The ghats are lit from dusk.
export const LIGHTING_AT = Date.parse("2026-11-24T17:15:00+05:30");

// Per-passenger price on a shared boat. It starts at ₹5,499 and rises ₹100 every day until the festival,
// so booking early is always cheapest.
export const SEAT_PRICE_START_INR = 5499;
// What local boatmen ask per person on the ghat that night — shown struck through next to our price.
// Keep it above the last day's price (₹5,499 + 23 days × ₹100 = ₹7,799).
export const GHAT_PRICE_INR = 8999;
export const SEAT_PRICE_FROM = "2026-11-01";
export const DAILY_HIKE_INR = 100;

const daysBetween = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);

// Seat price on a given India date (YYYY-MM-DD).
export function seatPriceOn(iso: string): number {
    const last = iso > DEV_DEEPAWALI_DATE ? DEV_DEEPAWALI_DATE : iso;
    return SEAT_PRICE_START_INR + Math.max(0, daysBetween(SEAT_PRICE_FROM, last)) * DAILY_HIKE_INR;
}

// Today's price and the next few days', for the "price goes up every day" line.
export function seatPrices(todayIso: string, days = 3) {
    return Array.from({ length: days }, (_, i) => addDaysIso(todayIso, i))
        .filter((iso) => iso <= DEV_DEEPAWALI_DATE)
        .map((iso) => ({ iso, inr: seatPriceOn(iso) }));
}

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
export const DD_MAX_PEOPLE = 12;

export const WHATSAPP = "918175966910";
export const whatsappLink = (people: number, priceInr: number) =>
    `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
        `Namaste KashiGo! I'd like to book the Dev Deepawali shared boat ride (${DEV_DEEPAWALI_LABEL}) for ${people} ${people === 1 ? "person" : "people"} at ₹${priceInr.toLocaleString("en-IN")} per person.`,
    )}`;
