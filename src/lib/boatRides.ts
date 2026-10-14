// Public description of KashiGo's boat rides, shared by the homepage, /book,
// structured data and /llms.txt so every surface (and AI crawler) sees the same facts.
import { BOAT_PRICES_INR } from "@/lib/boatPrices";

export type BoatRide = { id: keyof typeof BOAT_PRICES_INR; name: string; time: string; summary: string };

export const BOAT_RIDES: BoatRide[] = [
    { id: "p1", name: "Sunrise Boat Ride + Bird Feeding", time: "5:30 AM", summary: "Watch Varanasi wake up from the Ganges — morning rituals along all the main ghats and Siberian gulls in winter." },
    { id: "p2", name: "Morning Ganga Aarti at Assi Ghat", time: "6:00 AM", summary: "The quieter dawn Aarti (Subah-e-Banaras) at Assi Ghat, seen from the river." },
    { id: "p3", name: "Day Ghat Tour", time: "12:00 PM", summary: "A daylight ride past the major ghats with the stories behind each one." },
    { id: "p4", name: "Temple + Boat Tour", time: "2:00 PM", summary: "Boat ride combined with a walk to the key temples of the old city." },
    { id: "p5", name: "Evening Ganga Aarti Boat Ride (Dashashwamedh)", time: "6:30 PM", summary: "A front-row view of the evening fire ceremony from a boat anchored at Dashashwamedh Ghat." },
    { id: "p6", name: "Sunset Boat Ride", time: "5:00 PM", summary: "Golden hour on the Ganges past the old ghats." },
];

export const CUSTOM_RIDE = { name: "Custom private boat (your route, your time)", summary: "Choose your own start ghat, destination and time." };

export const boatPrice = (id: keyof typeof BOAT_PRICES_INR) => BOAT_PRICES_INR[id];
export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export const BOAT_PRICE_RANGE = {
    low: Math.min(...BOAT_RIDES.map((r) => boatPrice(r.id))),
    high: BOAT_PRICES_INR.custom,
};

export const BOOKING_PHONE = "+91 81759 66910";
