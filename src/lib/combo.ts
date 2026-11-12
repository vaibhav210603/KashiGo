// Boat ride + a guru on Google Meet: the three offers shown side by side on the home page, and the prices behind
// /ride-and-consult. Safe to import from client and server code; the server prices every order with comboPrice().
//
// The line-up is a decoy: A, the boat ride (from ₹2,599), is what most people come for. B, a 45-minute session
// alone (₹2,999), is priced so it's rarely chosen on its own. C, the ride plus a session, costs only a little more
// than B (from ₹3,299), so next to B it reads as two things for the price of one, and it's the one people pick.
import { BOAT_PRICES_INR, noticeFeeInr, passengerFeeInr } from "@/lib/boatPrices";
import { BOAT_RIDES, type BoatRideId } from "@/lib/boatRides";

export type ComboPlan = "combo" | "consult";

// B: a 45-minute Google Meet with a guru, on its own.
export const CONSULT_ONLY_INR = 2999;
export const CONSULT_ONLY_MINUTES = 45;
// C: the ride's price + ₹700 buys a 30-minute Google Meet; the full 45 minutes is ₹300 more.
export const COMBO_ADD_INR = 700;
export const LONGER_MEET_INR = 300;
export const MEET_LENGTHS = [
    { minutes: 30, addInr: 0, label: "30-minute Google Meet", note: "Included" },
    { minutes: 45, addInr: LONGER_MEET_INR, label: "45-minute Google Meet", note: `+₹${LONGER_MEET_INR}` },
] as const;
// Everyone also gets a free 5-minute call first, so the guru knows the question before the Meet.
export const FREE_CALL_MINUTES = 5;

const cheapestRide = Math.min(...BOAT_RIDES.map((r) => BOAT_PRICES_INR[r.id]));
export const RIDE_FROM_INR = cheapestRide;
export const COMBO_FROM_INR = cheapestRide + COMBO_ADD_INR;
// What the combo would cost bought separately (the cheapest ride + the session alone).
export const COMBO_WORTH_INR = cheapestRide + CONSULT_ONLY_INR;

// What people most often bring to an astrologer or numerologist in India.
export const CONCERNS = [
    "Love & relationships", "Marriage", "Career & job", "Money & finance", "Health", "Emotional peace & stress",
    "Family", "Business", "Life stability & direction", "Children", "Education", "Foreign travel & settling abroad",
    "Property & home", "Kundli & doshas",
] as const;

// Google Meet slots (India time). A slot today needs 2 hours' notice so a guru can be lined up.
export const MEET_SLOTS = ["10:00", "11:30", "13:00", "15:00", "17:00", "18:30", "20:00"] as const;
export const MEET_DAYS = 7; // today + the next 6 days
export const MEET_LEAD_MINUTES = 120;
export const slotLabel = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

export type ComboQuote = { boatInr: number; noticeInr: number; guestInr: number; consultInr: number; totalInr: number };

// The price of an order. For the combo: the ride (with today's short-notice charge and extra passengers),
// plus ₹700 for the session and ₹300 more for 45 minutes. The session alone is a flat ₹2,999.
export function comboPrice(o: { plan: ComboPlan; rideId?: BoatRideId | ""; guests?: number; noticePct?: number; minutes?: number }): ComboQuote {
    if (o.plan === "consult") return { boatInr: 0, noticeInr: 0, guestInr: 0, consultInr: CONSULT_ONLY_INR, totalInr: CONSULT_ONLY_INR };
    const boatInr = o.rideId ? BOAT_PRICES_INR[o.rideId] : 0;
    const noticeInr = boatInr ? noticeFeeInr(boatInr, o.noticePct ?? 0) : 0;
    const guestInr = boatInr ? passengerFeeInr(o.guests ?? 2) : 0;
    const consultInr = COMBO_ADD_INR + (o.minutes === 45 ? LONGER_MEET_INR : 0);
    return { boatInr, noticeInr, guestInr, consultInr, totalInr: boatInr + noticeInr + guestInr + consultInr };
}
