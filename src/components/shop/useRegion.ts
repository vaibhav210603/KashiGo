"use client";

import { useCurrency } from "@/lib/currency";

// Visitors in India default to INR (Razorpay/UPI); everyone else to USD (PayPal).
// Shared with the header's currency switcher, so a choice made anywhere applies everywhere.
export function useRegion() {
    return useCurrency();
}
