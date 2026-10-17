"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Eyebrow, SplitWords } from "@/components/motion/primitives";
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

    const renderCard = (c: (typeof cards)[number], copy: boolean, i: number) => (
        <Link key={`${copy ? "b" : "a"}-${c.href}`} href={c.href} aria-hidden={copy || undefined} tabIndex={copy ? -1 : undefined}
            onFocus={pause}
            className="group relative shrink-0 w-[78%] sm:w-[44%] md:w-[31%] lg:w-[23.5%] aspect-[3/4.2] overflow-hidden rounded-[1.75rem] bg-night-3 ring-1 ring-white/10 transition-[transform,box-shadow] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:shadow-[0_30px_80px_-20px_rgba(255,122,26,0.55)]">
            <Image src={c.image} alt={copy ? "" : `${c.name} — Varanasi boat ride`} fill className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110" sizes="(max-width:768px) 80vw, 25vw" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-night/10 transition-opacity duration-700 group-hover:opacity-90" />
            {/* Fire rim that lights up on hover */}
            <div aria-hidden className="absolute inset-0 rounded-[1.75rem] opacity-0 ring-1 ring-inset ring-marigold/60 transition-opacity duration-700 group-hover:opacity-100" />

            <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5">
                <span className="font-display italic text-white/60 text-sm">{String(i + 1).padStart(2, "0")} / {String(cards.length).padStart(2, "0")}</span>
                {c.badge && <span className="rounded-full bg-marigold px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-night">{c.badge}</span>}
            </div>

            <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.2em] text-marigold"><Clock size={13} />{c.time}</p>
                <h3 className="mt-2 font-display text-[1.9rem] leading-[1] text-white tracking-tight">{c.name}</h3>
                <p className="mt-2 text-sm text-white/65 line-clamp-2 max-h-0 opacity-0 transition-all duration-700 group-hover:max-h-12 group-hover:opacity-100 [@media(hover:none)]:max-h-12 [@media(hover:none)]:opacity-100">{c.summary}</p>
                <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-4">
                    <p className="text-white"><span className="text-xs text-white/50">from </span><span className="font-display text-2xl">{inr(c.price)}</span></p>
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-night transition-all duration-500 group-hover:w-24 group-hover:bg-marigold">
                        <span className="hidden text-sm font-semibold group-hover:inline mr-1">Book</span><ArrowUpRight size={18} />
                    </span>
                </div>
            </div>
        </Link>
    );

    const arrow = "w-12 h-12 shrink-0 rounded-full border border-white/20 inline-flex items-center justify-center text-white hover:bg-marigold hover:border-marigold hover:text-night transition-colors";

    return (
        <section id="rides" className="grain relative bg-night py-16 md:py-24 scroll-mt-16 overflow-hidden" aria-roledescription="carousel" aria-label="Boat rides">
            <div aria-hidden className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-ganga/10 blur-[120px]" />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <Eyebrow className="text-marigold">Private boat · price is for the whole boat</Eyebrow>
                    <h2 className="mt-4 font-display font-light text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-[-0.03em] text-white">
                        <SplitWords text="The river," />{" "}
                        <SplitWords text="by the hour." delay={0.15} className="italic" wordClassName={() => "text-fire pr-[0.05em]"} />
                    </h2>
                    <p className="mt-4 text-sm text-white/50">{cards.length} rides · drag, swipe or use the arrows</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/book#prices" className="group hidden sm:inline-flex items-center gap-2 mr-3 text-sm font-medium text-white/80 hover:text-marigold">All prices <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></Link>
                    <button type="button" onClick={() => go(-1)} aria-label="Previous rides" className={arrow}><ChevronLeft size={22} /></button>
                    <button type="button" onClick={() => go(1)} aria-label="Next rides" className={arrow}><ChevronRight size={22} /></button>
                </div>
            </div>

            <div className="relative mt-10 max-w-7xl mx-auto">
                <div ref={railRef}
                    onPointerEnter={(e) => { if (e.pointerType === "mouse") hovering.current = true; }}
                    onPointerLeave={() => { hovering.current = false; }}
                    onTouchStart={pause} onTouchMove={pause} onWheel={pause}
                    data-lenis-prevent-wheel
                    className="flex gap-5 overflow-x-auto px-4 sm:px-6 pb-8 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,transparent,black_1.5rem,black_calc(100%-4rem),transparent)]">
                    {cards.map((c, i) => renderCard(c, false, i))}
                    {cards.map((c, i) => renderCard(c, true, i))}
                </div>
            </div>

            <div className="relative mx-auto mt-2 flex max-w-7xl items-center gap-4 px-4 sm:px-6" aria-hidden>
                <span className="font-display italic text-marigold">{String(active + 1).padStart(2, "0")}</span>
                <div className="relative h-px flex-1 bg-white/15">
                    <span className="absolute inset-y-[-1px] left-0 bg-gradient-to-r from-marigold to-fire transition-[width] duration-500" style={{ width: `${((active + 1) / cards.length) * 100}%` }} />
                </div>
                <span className="font-display italic text-white/40">{String(cards.length).padStart(2, "0")}</span>
            </div>
        </section>
    );
}
