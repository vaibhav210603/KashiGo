"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ShieldCheck, X } from "lucide-react";
import { inr, istNow } from "@/lib/boatRides";
import { EARLY_BIRD_INR, EARLY_BIRD_LEFT, EARLY_BIRD_OPEN, EARLY_BIRD_SEATS, EARLY_BIRD_TAKEN, regularPriceOn } from "@/lib/devDeepawali";
import { track } from "@/lib/analytics";

// Site-wide: a few seconds into a visit, an urgent card for the Dev Deepawali early-bird offer with the boat photo
// and one button to the Dev Deepawali page. Once per browser session; never on that page itself or in admin,
// checkout and thank-you flows. Waits for any other dialog (the ₹ / $ prompt) to close first.
const KEY = "kg_dd_earlybird_popup";
const SKIP = ["/dev-deepawali", "/admin", "/thank-you", "/quote", "/book", "/account"];

export default function EarlyBirdPopup() {
    const path = usePathname() ?? "";
    const [open, setOpen] = useState(false);
    const [was, setWas] = useState(0);

    useEffect(() => {
        if (!EARLY_BIRD_OPEN || SKIP.some((p) => path.startsWith(p))) return;
        try { if (sessionStorage.getItem(KEY)) return; } catch { /* storage blocked: still show once */ }
        let t: ReturnType<typeof setTimeout>;
        const tryOpen = () => {
            if (document.querySelector('[role="dialog"]')) { t = setTimeout(tryOpen, 2500); return; }
            setWas(regularPriceOn(istNow().iso));
            setOpen(true);
            track("dd_popup_shown", { path });
        };
        t = setTimeout(tryOpen, 4000);
        return () => clearTimeout(t);
    }, [path]);

    if (!open) return null;
    const close = () => {
        setOpen(false);
        try { sessionStorage.setItem(KEY, "1"); } catch { /* ignore */ }
    };

    return (
        <div role="dialog" aria-modal="true" aria-labelledby="dd-popup-h" onClick={close}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-night/70 p-3 backdrop-blur-sm sm:items-center sm:p-4">
            <div onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-md overflow-hidden rounded-[1.75rem] border-2 border-[#e8c158] bg-[#0a1c52] text-white shadow-[0_30px_80px_-20px_rgba(232,193,88,0.6)]">
                <div className="relative aspect-[16/9]">
                    {/* eslint-disable-next-line @next/next/no-img-element -- photo of our boat */}
                    <img src="/dev-deepawali/our-boat.jpg" alt="The KashiGo boat, lit for Dev Deepawali" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a1c52]" />
                    <span className="absolute bottom-3 left-3 rounded-lg bg-[#d7191f] px-3 py-1.5 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_6px_20px_rgba(215,25,31,0.7)]">Get this exact boat</span>
                    <span className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-[#d7191f] px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] shadow-lg">
                        <span className="relative flex h-2 w-2"><span className="absolute h-full w-full animate-ping rounded-full bg-white/80" /><span className="relative h-2 w-2 rounded-full bg-white" /></span>
                        Limited time offer
                    </span>
                    <button type="button" onClick={close} aria-label="Close"
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-night/70 text-white/90 hover:bg-night">
                        <X size={18} />
                    </button>
                </div>
                <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ff9b9b]">Early-bird offer · Dev Deepawali · Tue 24 Nov</p>
                    <h2 id="dd-popup-h" className="mt-1.5 font-display text-2xl leading-tight sm:text-3xl">Last {EARLY_BIRD_LEFT} seats remaining! <span className="text-[#ff7070]">Limited time offer!</span></h2>
                    <p className="mt-3 font-display leading-none">
                        {was > 0 && <s className="mr-2 align-middle font-sans text-lg text-white/50 decoration-[#ff6b6b] decoration-[3px]">{inr(was)}</s>}
                        <span className="text-5xl text-[#e8c158]">{inr(EARLY_BIRD_INR)}</span>
                        <span className="ml-1.5 font-sans text-sm text-white/65">per person</span>
                    </p>
                    <p className="mt-2 text-sm text-white/75">This price ends the moment these {EARLY_BIRD_LEFT} seats are booked — then it&apos;s back to {was > 0 ? inr(was) : "the regular price"}.</p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/12">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#e8c158] to-[#ff6b6b]" style={{ width: `${(EARLY_BIRD_TAKEN / EARLY_BIRD_SEATS) * 100}%` }} />
                    </div>
                    <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-[#7ee0c9]"><ShieldCheck size={16} /> Best prices and 100% money-back guarantee!</p>
                    <Link href="/dev-deepawali" onClick={() => { track("dd_cta", { from: "popup" }); close(); }}
                        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#f3d27a] bg-gradient-to-b from-[#f9e29a] to-[#d6a332] text-base font-bold text-[#0a1c52] shadow-[0_10px_30px_-10px_rgba(232,193,88,0.9)]">
                        Grab my seat at {inr(EARLY_BIRD_INR)} <ArrowRight size={17} />
                    </Link>
                    <button type="button" onClick={close} className="mt-2 w-full py-1 text-center text-xs text-white/50 hover:text-white/80">Maybe later</button>
                </div>
            </div>
        </div>
    );
}
