"use client";

import { useEffect, useState } from "react";

// Visitors in India see INR (Razorpay/UPI); everyone else sees USD (PayPal).
export function useRegion() {
    const [region, setRegion] = useState<"inr" | "usd">("usd");
    useEffect(() => {
        try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (tz === "Asia/Calcutta" || tz === "Asia/Kolkata") setRegion("inr");
        } catch { }
    }, []);
    return [region, setRegion] as const;
}
