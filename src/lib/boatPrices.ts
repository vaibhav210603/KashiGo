// Boat ride prices (private boat, INR). Safe to import from client components —
// keep coupons and anything else secret in pricing.ts, which is server-only.
// Raised +20% twice (Oct 2026) over typical Varanasi private-boat rates (Oct 2026: ~₹800–1,500 sunrise/sunset,
// ~₹1,200–2,000 evening Aarti, ~₹600–1,000 daytime) to leave room for discount codes.
export const BOAT_PRICES_INR = {
    p1: 2599,  // Sunrise + Bird Feeding
    p2: 2599,  // Morning Ganga Aarti
    p3: 2599,  // Day Ghat Tour
    p4: 2599,  // Temple + Boat Tour
    p5: 2599,  // Dashashwamedh Evening Aarti
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
