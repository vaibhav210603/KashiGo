// Boat ride prices (private boat, INR). Safe to import from client components —
// keep coupons and anything else secret in pricing.ts, which is server-only.
export const BOAT_PRICES_INR = {
    p1: 1013,  // Sunrise + Bird Feeding
    p2: 1418,  // Morning Ganga Aarti
    p3: 810,   // Day Ghat Tour
    p4: 1824,  // Temple + Boat Tour
    p5: 1621,  // Dashashwamedh Evening Aarti
    p6: 1216,  // Sunset Ride
    custom: 3041,
} as const;
