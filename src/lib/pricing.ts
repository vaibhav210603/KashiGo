// Server-side price catalog. Payment routes must NEVER trust a client-sent amount —
// all prices are resolved here from the product id.

export type ProductId =
    | "guide"
    | "india-tour"
    | "custom-boat"
    | "p1" | "p2" | "p3" | "p4" | "p5" | "p6"
    | "india-scam-proof" | "kashi-unveiled" | "walk-the-ghats"
    | "scam-proof-audiobook" | "complete-bundle";

const INR_PRICES: Record<ProductId, number> = {
    guide: 999,
    "india-scam-proof": 699,
    "kashi-unveiled": 699,
    "walk-the-ghats": 499,
    "scam-proof-audiobook": 499,
    "complete-bundle": 1699,
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
    "india-scam-proof": 9.99,
    "kashi-unveiled": 9.99,
    "walk-the-ghats": 7.99,
    "scam-proof-audiobook": 7.99,
    "complete-bundle": 24.99,
};

// Coupons for the digital shop products (fraction off)
const SHOP_COUPONS: Record<string, number> = {
    LAUNCH40: 0.4,
    INSIDER20: 0.2,
    KASHISECRET: 0.5,
};

export function isShopProduct(product: string): boolean {
    return ["india-scam-proof", "kashi-unveiled", "walk-the-ghats", "scam-proof-audiobook", "complete-bundle"].includes(product);
}

function couponRate(product: string, coupon?: string): number {
    const code = (coupon || "").trim().toUpperCase();
    if (!code) return 0;
    if (product === "guide") return GUIDE_COUPONS[code] ?? (code === "LAUNCH40" ? 0.4 : 0);
    if (isShopProduct(product)) return SHOP_COUPONS[code] ?? 0;
    return 0;
}

// Guide discount coupons (fraction off)
const GUIDE_COUPONS: Record<string, number> = {
    KASHISECRET: 0.5,
    EXCLUSIVE20: 0.2,
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
    const rate = couponRate(product, coupon);
    if (rate > 0) {
        return Math.round(base * (1 - rate));
    }
    if (isBoatProduct(product) && code === BOAT_COUPON_CODE) {
        return BOAT_COUPON_PRICE_INR;
    }
    return base;
}

export function getAmountUSD(product: string, coupon?: string): number | null {
    const usdBase = USD_PRICES[product as ProductId];
    if (usdBase !== undefined) {
        const rate = couponRate(product, coupon);
        if (rate > 0) {
            return Number((usdBase * (1 - rate)).toFixed(2));
        }
        return usdBase;
    }
    const inr = getAmountINR(product, coupon);
    if (inr === null) return null;
    return Number((inr / INR_TO_USD_RATE).toFixed(2));
}
