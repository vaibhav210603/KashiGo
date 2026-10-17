"use client";

import { useCurrency, type Currency } from "@/lib/currency";

// Compact ₹ / $ switch for the header and mobile menu.
export default function CurrencyToggle({ className = "" }: { className?: string }) {
    const [currency, setCurrency] = useCurrency();
    return (
        <div role="group" aria-label="Currency" className={`relative inline-flex h-10 items-center rounded-full border border-white/20 p-1 text-sm font-semibold ${className}`}>
            <span aria-hidden className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${currency === "usd" ? "translate-x-full" : "translate-x-0"}`} />
            {(["inr", "usd"] as Currency[]).map((c) => (
                <button key={c} type="button" onClick={() => setCurrency(c)} aria-pressed={currency === c}
                    title={c === "inr" ? "Show prices in Indian rupees" : "Show prices in US dollars"}
                    className={`relative z-10 h-8 w-9 rounded-full transition-colors ${currency === c ? "text-night" : "text-white/70 hover:text-white"}`}>
                    {c === "inr" ? "₹" : "$"}
                </button>
            ))}
        </div>
    );
}
