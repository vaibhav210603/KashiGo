"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { hasChosenCurrency, useCurrency, type Currency } from "@/lib/currency";

// First visit only: ask ₹ or $ up front. After a choice it lives in the header switch (CurrencyToggle).
export default function CurrencyPrompt() {
    const [currency, setCurrency] = useCurrency();
    const [open, setOpen] = useState(false);
    const path = usePathname();

    useEffect(() => {
        if (path?.startsWith("/admin") || hasChosenCurrency()) return;
        const t = setTimeout(() => setOpen(true), 900);
        return () => clearTimeout(t);
    }, [path]);

    if (!open) return null;
    const choose = (c: Currency) => { setCurrency(c); setOpen(false); };

    return (
        <div role="dialog" aria-modal="true" aria-labelledby="currency-prompt-h"
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-night/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-[1.75rem] border border-white/10 bg-night p-6 text-center shadow-2xl">
                <h2 id="currency-prompt-h" className="font-display text-2xl text-white">Show prices in</h2>
                <p className="mt-1 text-sm text-white/60">You can change this anytime from the ₹ / $ switch at the top.</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                    {(["inr", "usd"] as Currency[]).map((c) => (
                        <button key={c} type="button" onClick={() => choose(c)}
                            className={`rounded-2xl border px-4 py-4 transition-colors ${currency === c ? "border-marigold bg-marigold/10" : "border-white/15 hover:border-marigold/60"}`}>
                            <span className="block font-display text-3xl text-marigold">{c === "inr" ? "₹" : "$"}</span>
                            <span className="mt-1 block text-sm font-semibold text-white">{c === "inr" ? "Indian rupees" : "US dollars"}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
