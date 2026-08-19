// Server-side price catalog. Payment routes must NEVER trust a client-sent amount —
// all prices are resolved here from the product id.

export type ProductId =
    | "guide"
    | "india-tour"
    | "custom-boat"
    | "p1" | "p2" | "p3" | "p4" | "p5" | "p6";

const INR_PRICES: Record<ProductId, number> = {
    guide: 999,
    "india-tour": 2374,
    "custom-boat": 2534,
    p1: 844,   // Sunrise + Bird Feeding
    p2: 1182,  // Morning Ganga Aarti
    p3: 675,   // Day Ghat Tour
    p4: 1520,  // Temple + Boat Tour
    p5: 1351,  // Dashashwamedh Evening Aarti
    p6: 1013,  // Sunset Ride
};

const USD_PRICES: Partial<Record<ProductId, number>> = {
    guide: 14.99,
    "india-tour": 29,
};

// Guide discount coupons (fraction off)
const GUIDE_COUPONS: Record<string, number> = {
    KASHISECRET: 0.5,
    EXCLUSIVE20: 0.2,
    TEST817: 0.99,
};

// Boat booking coupon: fixed ₹10 price
const BOAT_COUPON_CODE = "KASHIGO21";
const BOAT_COUPON_PRICE_INR = 10;

const INR_TO_USD_RATE = 83;

function isBoatProduct(product: string): boolean {
    return product === "custom-boat" || /^p[1-6]$/.test(product);
}

export function getAmountINR(product: string, coupon?: string): number | null {
    const base = INR_PRICES[product as ProductId];
    if (!base) return null;
    const code = (coupon || "").trim().toUpperCase();
    if (product === "guide" && code && GUIDE_COUPONS[code] !== undefined) {
        return Math.round(base * (1 - GUIDE_COUPONS[code]));
    }
    if (isBoatProduct(product) && code === BOAT_COUPON_CODE) {
        return BOAT_COUPON_PRICE_INR;
    }
    return base;
}

export function getAmountUSD(product: string, coupon?: string): number | null {
    const usdBase = USD_PRICES[product as ProductId];
    if (usdBase !== undefined) {
        const code = (coupon || "").trim().toUpperCase();
        if (product === "guide" && code && GUIDE_COUPONS[code] !== undefined) {
            return Number((usdBase * (1 - GUIDE_COUPONS[code])).toFixed(2));
        }
        return usdBase;
    }
    const inr = getAmountINR(product, coupon);
    if (inr === null) return null;
    return Number((inr / INR_TO_USD_RATE).toFixed(2));
}
