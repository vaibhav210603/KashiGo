// Public description of KashiGo's boat rides, shared by the homepage, /book,
// structured data and /llms.txt so every surface (and AI crawler) sees the same facts.
import { BOAT_PRICES_INR, SURGE_PCT } from "@/lib/boatPrices";

export type BoatRideId = "p1" | "p2" | "p3" | "p4" | "p5" | "p6";
// `perks`: extras included with the ride, shown on its card, the booking screen and its page.
export type BoatRide = { id: BoatRideId; name: string; short: string; time: string; summary: string; image: string; badge?: string; slot: "Morning" | "Afternoon" | "Evening"; perks?: string[] };

export const BOAT_RIDES: BoatRide[] = [
    { id: "p1", name: "Sunrise Boat Ride + Bird Feeding", short: "Sunrise ride", time: "5:30 AM", image: "/sunrise_bg.png", badge: "Best photos", slot: "Morning", summary: "Watch Varanasi wake up from the Ganges — morning rituals along all the main ghats and Siberian gulls in winter." },
    { id: "p2", name: "Morning Ganga Aarti at Assi Ghat", short: "Morning Aarti", time: "6:00 AM", image: "/m_aarti_bg.png", slot: "Morning", summary: "The quieter dawn Aarti (Subah-e-Banaras) at Assi Ghat, seen from the river." },
    { id: "p3", name: "Day Ghat Tour", short: "Day ghat tour", time: "12:00 PM", image: "/day_ghat_bg.png", badge: "Lowest price", slot: "Afternoon", summary: "A daylight ride past the major ghats with the stories behind each one." },
    { id: "p4", name: "Temple + Boat Tour", short: "Temple + boat", time: "2:00 PM", image: "/temple_boat_bg.png", slot: "Afternoon", summary: "Boat ride combined with a walk to the key temples of the old city." },
    { id: "p5", name: "Evening Ganga Aarti Boat Ride (7+ Aartis)", short: "Evening Ganga Aarti", time: "6:30 PM", image: "/e_aarti_bg.png", badge: "Most popular", slot: "Evening", summary: "See 7+ aartis on different ghats and the whole ghat tour, on your own private boat — with front-row views of the grand evening fire ceremony.", perks: ["A private boat, just for your group", "3 diyas for deep daan", "Life jackets for everyone", "Memorable photos of your evening", "300 KashiGo coins for a video review"] },
    { id: "p6", name: "Sunset Boat Ride", short: "Sunset ride", time: "5:00 PM", image: "/sunset_bg.png", slot: "Evening", summary: "Golden hour on the Ganges past the old ghats." },
];

export const CUSTOM_RIDE = { name: "Custom private boat (your route, your time)", short: "Custom ride", summary: "Choose your own start ghat, destination and time.", image: "/custom_bg.png" };

// Most-wanted first — the order rides are shown in on the homepage and booking screen.
export const POPULAR_ORDER: BoatRideId[] = ["p5", "p1", "p6", "p2", "p3", "p4"];
export const RIDES_BY_POPULARITY = POPULAR_ORDER.map((id) => BOAT_RIDES.find((r) => r.id === id)!);

export const GHATS = ["Dashashwamedh Ghat", "Assi Ghat", "Namo Ghat", "Manikarnika Ghat", "Panchganga Ghat"];

export const boatPrice = (id: keyof typeof BOAT_PRICES_INR) => BOAT_PRICES_INR[id];
export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export const BOAT_PRICE_RANGE = {
    low: Math.min(...BOAT_RIDES.map((r) => boatPrice(r.id))),
    high: BOAT_PRICES_INR.custom,
};

export const BOOKING_PHONE = "+91 81759 66910";

// ---- Booking time rules (shared by the booking screen and /api/booking) ----
// Rides happen in Varanasi, so "today" and "too late" are always judged in India time,
// whatever timezone the visitor's phone is in.
export const BOOKING_WINDOW_DAYS = 8; // today + the next 7 days
export const BOOKING_LEAD_MINUTES = 60; // less notice than this on a same-day ride is accepted, but flagged (bookingTimeWarning)

export function istNow(at: Date = new Date()): { iso: string; minutes: number } {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(at);
    const get = (t: string) => parts.find((p) => p.type === t)?.value || "0";
    return { iso: `${get("year")}-${get("month")}-${get("day")}`, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export function addDaysIso(iso: string, days: number): string {
    const d = new Date(`${iso}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
}

// "5:30 AM" or "17:30" → minutes after midnight; NaN if unreadable.
export function toMinutes(time: string): number {
    const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(time.trim());
    if (!m) return NaN;
    let h = Number(m[1]);
    const min = Number(m[2]);
    if (m[3]) h = (h % 12) + (m[3].toUpperCase() === "PM" ? 12 : 0);
    return h < 24 && min < 60 ? h * 60 + min : NaN;
}

export function rideStartMinutes(rideId: string, customTime?: string): number {
    if (rideId === "custom" || rideId === "custom-boat") return toMinutes(customTime || "");
    const ride = BOAT_RIDES.find((r) => r.id === rideId);
    return ride ? toMinutes(ride.time) : NaN;
}

// Why this date/time can't be booked, or null if it can.
export function bookingTimeProblem(dateIso: string, startMinutes: number, now = istNow()): string | null {
    // Round-trip check rejects impossible dates like 2026-10-32 that Date would silently roll over.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateIso) || Number.isNaN(Date.parse(`${dateIso}T00:00:00Z`)) || addDaysIso(dateIso, 0) !== dateIso) return "Pick a date for your ride.";
    if (Number.isNaN(startMinutes)) return "Pick a start time for your ride.";
    if (dateIso < now.iso) return "That date has already passed — pick today or a later date.";
    if (dateIso > addDaysIso(now.iso, BOOKING_WINDOW_DAYS - 1)) return `Rides can be booked up to ${BOOKING_WINDOW_DAYS - 1} days ahead — call +91 81759 66910 for later dates.`;
    return null;
}

// A same-day ride starting within the hour (or already started) is still booked — we confirm by phone and
// refund in full if no boat can be arranged. Shown to the customer and flagged to the owner; never blocks.
export function bookingTimeWarning(dateIso: string, startMinutes: number, now = istNow()): string | null {
    if (dateIso !== now.iso || Number.isNaN(startMinutes) || startMinutes >= now.minutes + BOOKING_LEAD_MINUTES) return null;
    return startMinutes <= now.minutes
        ? "This ride's usual start time has passed — we'll call you right away to arrange a boat, and refund you in full if we can't."
        : "This ride starts in under an hour — we'll call you right away to confirm your boat, and refund you in full if we can't make it.";
}

// How much notice a ride has, and the short-notice surcharge that goes with it (lib/boatPrices.ts).
// "urgent" = the ride is today; "nextDay" = tomorrow; "planned" = 2+ days ahead. Only the India date counts —
// `startMinutes` is kept so callers needn't change if a time-of-day rule comes back.
export type Notice = { tier: "urgent" | "nextDay" | "planned"; pct: number };
export function noticeFor(dateIso: string, _startMinutes: number, now = istNow()): Notice {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateIso) || dateIso <= now.iso) return { tier: "urgent", pct: SURGE_PCT.urgent };
    if (dateIso === addDaysIso(now.iso, 1)) return { tier: "nextDay", pct: SURGE_PCT.nextDay };
    return { tier: "planned", pct: 0 };
}

// India time at a given moment (a payment order's creation time), for pricing a payment as it was quoted.
export const istAt = (unixSeconds: number) => istNow(new Date(unixSeconds * 1000));
