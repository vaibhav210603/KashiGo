"use client";

import { useSyncExternalStore } from "react";
import { INR_PER_USD } from "@/lib/boatPrices";

export type Currency = "inr" | "usd";

// One currency choice for the whole site, remembered per visitor. First visit: India's
// timezone → ₹, everyone else → $. The server always renders ₹ (matching the structured data).
const KEY = "kashigo-currency";
const listeners = new Set<() => void>();
let current: Currency | null = null;

function detect(): Currency {
    try {
        const saved = localStorage.getItem(KEY);
        if (saved === "inr" || saved === "usd") return saved;
    } catch { }
    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz === "Asia/Calcutta" || tz === "Asia/Kolkata") return "inr";
    } catch { }
    return "usd";
}

const get = () => (current ??= detect());
const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };

export function setCurrency(c: Currency) {
    current = c;
    try { localStorage.setItem(KEY, c); } catch { }
    listeners.forEach((fn) => fn());
}

export function useCurrency() {
    const currency = useSyncExternalStore(subscribe, get, () => "inr" as Currency);
    return [currency, setCurrency] as const;
}

// An INR-priced amount (boat rides) shown in the chosen currency. USD uses the same rate PayPal charges.
export function money(inrAmount: number, currency: Currency): string {
    return currency === "inr" ? `₹${inrAmount.toLocaleString("en-IN")}` : `$${(inrAmount / INR_PER_USD).toFixed(2)}`;
}

// A product with its own USD price (guides, ebooks).
export function priced(inrAmount: number, usdAmount: number, currency: Currency): string {
    return currency === "inr" ? `₹${inrAmount.toLocaleString("en-IN")}` : `$${usdAmount.toFixed(2)}`;
}
