// Boat ride prices (private boat, INR). Safe to import from client components —
// keep coupons and anything else secret in pricing.ts, which is server-only.
// Set ~20% above typical Varanasi private-boat rates (Oct 2026: ~₹800–1,500 sunrise/sunset,
// ~₹1,200–2,000 evening Aarti, ~₹600–1,000 daytime) to leave room for discount codes.
export const BOAT_PRICES_INR = {
    p1: 1380,  // Sunrise + Bird Feeding
    p2: 1380,  // Morning Ganga Aarti
    p3: 990,   // Day Ghat Tour
    p4: 2190,  // Temple + Boat Tour
    p5: 1920,  // Dashashwamedh Evening Aarti
    p6: 1380,  // Sunset Ride
    custom: 3041,
} as const;
