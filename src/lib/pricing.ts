// Server-side price catalog. Payment routes must NEVER trust a client-sent amount —
// all prices are resolved here from the product id (and a coupon rule from lib/coupons).
import { BOAT_PRICES_INR, INR_PER_USD, rideTotalInr } from "@/lib/boatPrices";

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
    "custom-boat": BOAT_PRICES_INR.custom,
    p1: rideTotalInr(BOAT_PRICES_INR.p1), // ride + return journey
    p2: rideTotalInr(BOAT_PRICES_INR.p2), // ride + return journey
    p3: rideTotalInr(BOAT_PRICES_INR.p3), // ride + return journey
    p4: rideTotalInr(BOAT_PRICES_INR.p4), // ride + return journey
    p5: rideTotalInr(BOAT_PRICES_INR.p5), // ride + return journey
    p6: rideTotalInr(BOAT_PRICES_INR.p6), // ride + return journey
};

// Products sold with their own dollar price. Everything else (boat rides) converts at INR_PER_USD.
const USD_PRICES: Partial<Record<ProductId, number>> = {
    guide: 14.99,
    "india-tour": 29,
    "india-scam-proof": 9.99,
    "kashi-unveiled": 9.99,
    "walk-the-ghats": 7.99,
    "scam-proof-audiobook": 7.99,
    "complete-bundle": 24.99,
};

const SHOP_PRODUCTS = ["india-scam-proof", "kashi-unveiled", "walk-the-ghats", "scam-proof-audiobook", "complete-bundle"];

export function isShopProduct(product: string): boolean {
    return SHOP_PRODUCTS.includes(product);
}

export function isBoatProduct(product: string): boolean {
    return product === "custom-boat" || /^p[1-6]$/.test(product);
}

export const isProduct = (product: string): product is ProductId => product in INR_PRICES;

// The groups a coupon's `applies_to` can name, besides individual product ids.
export function scopesFor(product: string): string[] {
    const s = ["all", product];
    if (isBoatProduct(product)) s.push("boat");
    if (isShopProduct(product)) s.push("shop");
    return s;
}

// A coupon as stored in the `coupons` table (see supabase/accounts_credits_admin.sql).
export type CouponRule = {
    code: string;
    kind: "percent" | "amount_off" | "fixed_price";
    value: number; // percent 1–100, or rupees
    applies_to: string[];
};

// Used only if the coupons table isn't there yet (before the migration runs) — the old hard-coded codes.
export const LEGACY_RULES: CouponRule[] = [
    { code: "WELCOME10", kind: "percent", value: 10, applies_to: ["all"] },
    { code: "BLISS20", kind: "percent", value: 20, applies_to: ["all"] },
    { code: "LAUNCH40", kind: "percent", value: 40, applies_to: ["shop", "guide"] },
    { code: "INSIDER20", kind: "percent", value: 20, applies_to: ["shop"] },
    { code: "KASHISECRET", kind: "percent", value: 50, applies_to: ["shop", "guide"] },
    { code: "EXCLUSIVE20", kind: "percent", value: 20, applies_to: ["guide"] },
    { code: "KASHIGO21", kind: "fixed_price", value: 10, applies_to: ["boat"] },
];

export const ruleApplies = (rule: CouponRule, product: string) => rule.applies_to.some((s) => scopesFor(product).includes(s));

export type Price = { inr: number; usd: number };

// Price of a product, with a coupon rule if one applies. Null for an unknown product.
// A coupon never makes anything free here: the floor is ₹1 / $0.01 so a payment provider is always involved.
export function priceOf(product: string, rule?: CouponRule | null): Price | null {
    if (!isProduct(product)) return null;
    const baseInr = INR_PRICES[product];
    const ownUsd = USD_PRICES[product];
    const baseUsd = ownUsd ?? Number((baseInr / INR_PER_USD).toFixed(2));
    if (!rule || !ruleApplies(rule, product)) return { inr: baseInr, usd: baseUsd };

    let inr = baseInr;
    let usd = baseUsd;
    if (rule.kind === "percent") {
        const f = 1 - Math.min(rule.value, 100) / 100;
        inr = Math.round(baseInr * f);
        usd = ownUsd !== undefined ? Number((ownUsd * f).toFixed(2)) : Number((inr / INR_PER_USD).toFixed(2));
    } else if (rule.kind === "amount_off") {
        inr = baseInr - rule.value;
        usd = ownUsd !== undefined ? Number((ownUsd - rule.value / INR_PER_USD).toFixed(2)) : Number((inr / INR_PER_USD).toFixed(2));
    } else {
        inr = rule.value;
        usd = Number((rule.value / INR_PER_USD).toFixed(2));
    }
    return { inr: Math.max(1, Math.min(inr, baseInr)), usd: Math.max(0.01, Math.min(usd, baseUsd)) };
}

export const INR_TO_USD_RATE = INR_PER_USD;
