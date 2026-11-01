// Boat ride prices (private boat, INR). Safe to import from client components —
// keep coupons and anything else secret in pricing.ts, which is server-only.
// Raised +20% twice (Oct 2026) over typical Varanasi private-boat rates (Oct 2026: ~₹800–1,500 sunrise/sunset,
// ~₹1,200–2,000 evening Aarti, ~₹600–1,000 daytime) to leave room for discount codes.
export const BOAT_PRICES_INR = {
    p1: 2599,  // Sunrise + Bird Feeding
    p2: 2599,  // Morning Ganga Aarti
    p3: 2599,  // Day Ghat Tour
    p4: 2599,  // Temple + Boat Tour
    p5: 3699,  // Evening Aarti — 7+ aartis on different ghats + the full ghat tour, with extra privileges (Nov 2026)
    p6: 2599,  // Sunset Ride
    custom: 3650,
} as const;

// Fixed conversion used for USD (PayPal) charges and USD price display, so what's shown is what's billed.
export const INR_PER_USD = 83;

// Online bookings include 2 passengers in the boat price; each passenger after that adds ₹350.
export const FREE_PASSENGERS = 2;
export const EXTRA_PASSENGER_INR = 350;
export const passengerFeeInr = (guests: number) => Math.max(0, Math.trunc(guests) - FREE_PASSENGERS) * EXTRA_PASSENGER_INR;

// Optional return journey on a hand-made quotation (admin): 50% of the ride price, with the total
// rounded up to the next ₹100 (₹2,200 ride → ₹1,100 return). Online bookings don't add one.
export const returnFareInr = (ridePrice: number) => Math.ceil((ridePrice * 1.5) / 100) * 100 - ridePrice;

// Short-notice rates (online bookings). The prices above are the plan-ahead price, for rides booked
// 2+ days out. A ride today, or starting within 12 hours, is +80%; a ride tomorrow is +50%.
// Boatmen plan their week ahead; a late booking means pulling one in at short notice, and he's paid extra for it.
// The surcharge is on the boat only — the passenger charge and any code work as usual.
export const SHORT_NOTICE_HOURS = 12;
export const SURGE_PCT = { urgent: 80, nextDay: 50 } as const;
// The added amount, so a ₹2,599 boat becomes ₹3,899 (+50%) or ₹4,699 (+80%) — rounded up to end in 99.
export const noticeFeeInr = (boatInr: number, pct: number) => (pct > 0 ? Math.ceil((boatInr * (1 + pct / 100)) / 100) * 100 - 1 - boatInr : 0);
