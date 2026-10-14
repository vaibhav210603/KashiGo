"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { RIDES_BY_POPULARITY, CUSTOM_RIDE, boatPrice, inr } from "@/lib/boatRides";
import { BOAT_PRICES_INR } from "@/lib/boatPrices";

const cards = [
    ...RIDES_BY_POPULARITY.map((r) => ({ href: `/book?ride=${r.id}`, name: r.short, time: r.time, summary: r.summary, image: r.image, badge: r.badge, price: boatPrice(r.id) })),
    { href: "/book?ride=custom", name: CUSTOM_RIDE.short, time: "Any time", summary: CUSTOM_RIDE.summary, image: CUSTOM_RIDE.image, badge: undefined, price: BOAT_PRICES_INR.custom },
];

const SPEED = 28; // px per second — a slow drift, enough to show the strip moves
const RESUME_AFTER = 4000; // ms of no interaction before drifting again

// A slowly drifting, endlessly looping strip of ride cards. Each card links straight into
// the booking screen with that ride chosen. Hover, touch or the arrows pause the drift.
export default function RideRail() {
    const railRef = useRef<HTMLDivElement>(null);
    const pausedUntil = useRef(0);
    const hovering = useRef(false);
    const pos = useRef(0);
    const [active, setActive] = useState(0);

    // The cards are rendered twice; scrolling past the first set jumps back by its width, so the strip never ends.
    const setWidth = () => {
        const rail = railRef.current;
        const second = rail?.children[cards.length] as HTMLElement | undefined;
        const first = rail?.children[0] as HTMLElement | undefined;
        return second && first ? second.offsetLeft - first.offsetLeft : 0;
    };
    const cardStep = () => {
        const rail = railRef.current;
        const [a, b] = [rail?.children[0], rail?.children[1]] as (HTMLElement | undefined)[];
        return a && b ? b.offsetLeft - a.offsetLeft : 300;
    };
    const wrap = (x: number) => {
        const w = setWidth();
        if (!w) return x;
        return ((x % w) + w) % w;
    };

    useEffect(() => {
        const rail = railRef.current;
        if (!rail) return;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let raf = 0;
        let last = performance.now();

        const tick = (now: number) => {
            const dt = Math.min(now - last, 64);
            last = now;
            const idle = !hovering.current && now > pausedUntil.current && !document.hidden;
            if (idle && !reduce) {
                pos.current = wrap(pos.current + (SPEED * dt) / 1000);
                rail.scrollLeft = pos.current;
            } else {
                // Follow whatever the visitor scrolled to, and keep it inside the first copy.
                if (rail.scrollLeft >= setWidth()) rail.scrollLeft = wrap(rail.scrollLeft);
                pos.current = rail.scrollLeft;
            }
            setActive(Math.round(pos.current / cardStep()) % cards.length);
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const pause = () => { pausedUntil.current = performance.now() + RESUME_AFTER; };

    const go = (dir: 1 | -1) => {
        const rail = railRef.current;
        if (!rail) return;
        pause();
        const step = cardStep();
        const w = setWidth();
        // Snap to the nearest card, then move one. Shift by one copy first if the target would leave
        // [0, w) — the copies look identical, and the smooth scroll then never needs wrapping mid-flight.
        let from = Math.round(rail.scrollLeft / step) * step;
        const shift = from + dir * step < 0 ? w : from + dir * step >= w ? -w : 0;
        if (shift) { rail.scrollLeft += shift; from += shift; }
        rail.scrollTo({ left: from + dir * step, behavior: "smooth" });
    };

    const renderCard = (c: (typeof cards)[number], copy: boolean) => (
        <Link key={`${copy ? "b" : "a"}-${c.href}`} href={c.href} aria-hidden={copy || undefined} tabIndex={copy ? -1 : undefined}
            onFocus={pause}
            className="group shrink-0 w-[78%] sm:w-[44%] md:w-[31%] lg:w-[23.5%] rounded-3xl bg-white border border-slate-200/70 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-[box-shadow,transform]">
            <div className="relative aspect-[4/3] overflow-hidden">
                <Image src={c.image} alt={copy ? "" : `${c.name} — Varanasi boat ride`} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:768px) 80vw, 25vw" />
                {c.badge && <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-orange-600 shadow">{c.badge}</span>}
            </div>
            <div className="p-4">
                <p className="flex items-center gap-1 text-xs font-medium text-slate-500"><Clock size={14} />{c.time}</p>
                <h3 className="mt-1 font-heading font-semibold text-lg text-slate-900">{c.name}</h3>
                <p className="mt-1 text-sm text-slate-600 line-clamp-2">{c.summary}</p>
                <div className="mt-4 flex items-center justify-between">
                    <p className="font-heading font-bold text-xl text-slate-900">{inr(c.price)}</p>
                    <span className="h-10 px-5 inline-flex items-center rounded-full bg-orange-500 group-hover:bg-orange-600 text-white text-sm font-semibold">Book</span>
                </div>
            </div>
        </Link>
    );

    const arrow = "w-11 h-11 shrink-0 rounded-full bg-white border border-slate-200 shadow-md inline-flex items-center justify-center text-slate-800 hover:border-orange-300 hover:text-orange-600 transition-colors";

    return (
        <section id="rides" className="py-12 md:py-16 scroll-mt-16" aria-roledescription="carousel" aria-label="Boat rides">
            <div className="max-w-6xl mx-auto px-4 flex items-end justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-teal-700">Private boat · price is for the whole boat</p>
                    <h2 className="mt-1 font-heading font-bold text-3xl sm:text-4xl text-slate-900">Pick your ride</h2>
                    <p className="mt-1 text-sm text-slate-500">{cards.length} rides · swipe or use the arrows</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/book#prices" className="hidden sm:inline-flex items-center gap-1 mr-2 text-sm font-semibold text-orange-600">All prices <ArrowRight size={16} /></Link>
                    <button type="button" onClick={() => go(-1)} aria-label="Previous rides" className={arrow}><ChevronLeft size={22} /></button>
                    <button type="button" onClick={() => go(1)} aria-label="Next rides" className={arrow}><ChevronRight size={22} /></button>
                </div>
            </div>

            <div className="relative mt-6 max-w-6xl mx-auto">
                <div ref={railRef}
                    onPointerEnter={(e) => { if (e.pointerType === "mouse") hovering.current = true; }}
                    onPointerLeave={() => { hovering.current = false; }}
                    onTouchStart={pause} onTouchMove={pause} onWheel={pause}
                    className="flex gap-4 overflow-x-auto px-4 pb-4 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,transparent,black_1.5rem,black_calc(100%-3rem),transparent)]">
                    {cards.map((c) => renderCard(c, false))}
                    {cards.map((c) => renderCard(c, true))}
                </div>
            </div>

            <div className="mt-2 flex justify-center gap-1.5" aria-hidden>
                {cards.map((c, i) => (
                    <span key={c.href} className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? "w-6 bg-orange-500" : "w-1.5 bg-slate-300"}`} />
                ))}
            </div>
        </section>
    );
}
