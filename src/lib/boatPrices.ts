// Boat ride prices (private boat, INR). Safe to import from client components —
// keep coupons and anything else secret in pricing.ts, which is server-only.
// Raised +20% twice (Oct 2026) over typical Varanasi private-boat rates (Oct 2026: ~₹800–1,500 sunrise/sunset,
// ~₹1,200–2,000 evening Aarti, ~₹600–1,000 daytime) to leave room for discount codes.
export const BOAT_PRICES_INR = {
    p1: 1660,  // Sunrise + Bird Feeding
    p2: 1660,  // Morning Ganga Aarti
    p3: 1190,  // Day Ghat Tour
    p4: 2630,  // Temple + Boat Tour
    p5: 2300,  // Dashashwamedh Evening Aarti
    p6: 1660,  // Sunset Ride
    custom: 3650,
} as const;

// Fixed conversion used for USD (PayPal) charges and USD price display, so what's shown is what's billed.
export const INR_PER_USD = 83;
