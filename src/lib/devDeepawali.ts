// Dev Deepawali 2026 shared boat ride, shown on the home page (invitation banner + section).
// Booked on WhatsApp: we confirm the seats and send a payment link (a quotation, see /admin).
import { addDaysIso } from "@/lib/boatRides";

export const DEV_DEEPAWALI_DATE = "2026-11-24"; // Kartik Purnima, Tuesday 24 November 2026
export const DEV_DEEPAWALI_LABEL = "Tue 24 Nov";
// The ghats are lit from dusk.
export const LIGHTING_AT = Date.parse("2026-11-24T17:15:00+05:30");

// Per-passenger price on a shared boat. It starts at ₹4,599 and rises ₹100 every day until the festival,
// so booking early is always cheapest.
export const SEAT_PRICE_START_INR = 4599;
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

export const WHATSAPP = "918175966910";
export const whatsappLink = (people: number, priceInr: number) =>
    `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
        `Namaste KashiGo! I'd like to book the Dev Deepawali shared boat ride (${DEV_DEEPAWALI_LABEL}) for ${people} ${people === 1 ? "person" : "people"} at ₹${priceInr.toLocaleString("en-IN")} per person.`,
    )}`;
