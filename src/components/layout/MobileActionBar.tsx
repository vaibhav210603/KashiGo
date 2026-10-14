"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone } from "lucide-react";
import { BOAT_PRICES_INR } from "@/lib/boatPrices";

// One-tap booking on phones for browsing pages. Buying pages have their own CTAs.
export const SHOW_ON = (p: string) => p === "/" || p.startsWith("/blog") || p === "/about";
const FROM = Math.min(...Object.values(BOAT_PRICES_INR));

export default function MobileActionBar() {
    const pathname = usePathname() || "";
    // /book has its own sticky confirm bar — just keep the footer clear of it.
    if (pathname === "/book") return <div className="h-24" aria-hidden />;
    if (!SHOW_ON(pathname)) return null;
    return (
        <>
            <div className="h-20 md:hidden" aria-hidden />
            <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex gap-2">
                <a href="tel:+918175966910" aria-label="Call KashiGo"
                    className="h-12 w-12 shrink-0 inline-flex items-center justify-center rounded-full border border-slate-200 text-teal-600">
                    <Phone size={20} />
                </a>
                <Link href="/book" className="flex-1 h-12 inline-flex items-center justify-center rounded-full bg-orange-500 active:bg-orange-600 text-white font-semibold shadow-lg shadow-orange-500/30">
                    Book a boat ride · from ₹{FROM.toLocaleString("en-IN")}
                </Link>
            </div>
        </>
    );
}
