// Public description of KashiGo's boat rides, shared by the homepage, /book,
// structured data and /llms.txt so every surface (and AI crawler) sees the same facts.
import { BOAT_PRICES_INR } from "@/lib/boatPrices";

export type BoatRideId = "p1" | "p2" | "p3" | "p4" | "p5" | "p6";
export type BoatRide = { id: BoatRideId; name: string; short: string; time: string; summary: string; image: string; badge?: string; slot: "Morning" | "Afternoon" | "Evening" };

export const BOAT_RIDES: BoatRide[] = [
    { id: "p1", name: "Sunrise Boat Ride + Bird Feeding", short: "Sunrise ride", time: "5:30 AM", image: "/sunrise_bg.png", badge: "Best photos", slot: "Morning", summary: "Watch Varanasi wake up from the Ganges — morning rituals along all the main ghats and Siberian gulls in winter." },
    { id: "p2", name: "Morning Ganga Aarti at Assi Ghat", short: "Morning Aarti", time: "6:00 AM", image: "/m_aarti_bg.png", slot: "Morning", summary: "The quieter dawn Aarti (Subah-e-Banaras) at Assi Ghat, seen from the river." },
    { id: "p3", name: "Day Ghat Tour", short: "Day ghat tour", time: "12:00 PM", image: "/day_ghat_bg.png", badge: "Lowest price", slot: "Afternoon", summary: "A daylight ride past the major ghats with the stories behind each one." },
    { id: "p4", name: "Temple + Boat Tour", short: "Temple + boat", time: "2:00 PM", image: "/temple_boat_bg.png", slot: "Afternoon", summary: "Boat ride combined with a walk to the key temples of the old city." },
    { id: "p5", name: "Evening Ganga Aarti Boat Ride (Dashashwamedh)", short: "Evening Ganga Aarti", time: "6:30 PM", image: "/e_aarti_bg.png", badge: "Most popular", slot: "Evening", summary: "A front-row view of the evening fire ceremony from a boat anchored at Dashashwamedh Ghat." },
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
export const BOOKING_LEAD_MINUTES = 60; // a same-day ride needs this much notice for the boatman

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
    if (dateIso === now.iso && startMinutes < now.minutes + BOOKING_LEAD_MINUTES) {
        return "This ride starts too soon to book for today — pick tomorrow or a later date.";
    }
    return null;
}
