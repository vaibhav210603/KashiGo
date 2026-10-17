"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import { BOAT_RIDES, BOAT_PRICE_RANGE, istNow, toMinutes } from "@/lib/boatRides";
import { money, useCurrency } from "@/lib/currency";
import { SplitWords, Magnetic } from "@/components/motion/primitives";
import Embers from "@/components/motion/Embers";

const EASE = [0.16, 1, 0.3, 1] as const;
const TRUST = ["Fixed price", "Private boat", "Pay at ghat or online", "Run by a Varanasi local"];

// The next ride leaving today in Varanasi time (or tomorrow's first). Client-only to avoid hydration drift.
function useNextDeparture() {
    const [state, setState] = useState<{ clock: string; ride: string; time: string } | null>(null);
    useEffect(() => {
        const update = () => {
            const now = istNow();
            const sorted = [...BOAT_RIDES].sort((a, b) => toMinutes(a.time) - toMinutes(b.time));
            const next = sorted.find((r) => toMinutes(r.time) > now.minutes + 60) ?? sorted[0];
            const clock = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", hour12: true }).format(new Date());
            setState({ clock, ride: next.short, time: next.time });
        };
        update();
        const id = setInterval(update, 30_000);
        return () => clearInterval(id);
    }, []);
    return state;
}

export default function Hero() {
    const ref = useRef<HTMLElement>(null);
    const reduce = useReducedMotion();
    const next = useNextDeparture();
    const [currency] = useCurrency();
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
    const videoY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "22%"]);
    const videoScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.12]);
    const textY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-30%"]);
    const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
    const devaY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "40%"]);

    return (
        <section ref={ref} className="grain relative isolate overflow-hidden bg-night min-h-[100svh] flex flex-col justify-end pt-28 md:pt-32">
            {/* Ganges footage, drifting slower than the page. The poster shows until it plays (and on data-saver). */}
            <motion.div aria-hidden className="absolute inset-0 -z-20" style={{ y: videoY, scale: videoScale }}>
                <motion.video autoPlay loop muted playsInline preload="metadata" poster="/sunrise.png"
                    className="h-full w-full object-cover"
                    initial={reduce ? false : { scale: 1.18, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 2.4, ease: EASE }}>
                    <source src="/back_video.mp4" type="video/mp4" />
                </motion.video>
            </motion.div>
            <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_20%_100%,rgba(7,11,24,0.92)_10%,rgba(7,11,24,0.45)_55%,rgba(7,11,24,0.1)_100%)]" />
            <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-night via-transparent to-night/60" />
            {/* Warm fire glow rising off the river */}
            <div aria-hidden className="flicker absolute -bottom-40 left-1/2 -z-10 h-[50vh] w-[110vw] -translate-x-1/2 rounded-[100%] bg-fire/25 blur-[120px]" />
            <Embers className="-z-10" />

            {/* काशी — the city's own name, huge and faint */}
            <motion.p aria-hidden style={{ y: devaY }}
                className="pointer-events-none absolute right-[-4vw] top-[14vh] -z-10 select-none font-deva text-[38vw] md:text-[24vw] leading-none text-transparent [-webkit-text-stroke:1px_rgba(255,182,39,0.22)]"
                initial={reduce ? false : { opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 2, ease: EASE, delay: 0.3 }}>
                काशी
            </motion.p>

            <motion.div style={{ y: textY, opacity: textOpacity }} className="relative w-full max-w-7xl mx-auto px-4 sm:px-6">
                <motion.div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 py-1.5 pl-2 pr-4 text-xs text-white/80 backdrop-blur-md"
                    initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}>
                    <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-fire/20">
                        <span className="absolute h-full w-full animate-ping rounded-full bg-fire/40" />
                        <span className="h-2 w-2 rounded-full bg-marigold" />
                    </span>
                    {next ? (
                        <span><span className="text-white/50">Varanasi {next.clock} ·</span> Next departure <b className="font-semibold text-white">{next.ride}, {next.time}</b></span>
                    ) : (
                        <span>Booking now · Varanasi</span>
                    )}
                </motion.div>

                <h1 className="mt-6 max-w-5xl font-display font-light text-white text-[3.1rem] leading-[0.95] sm:text-7xl lg:text-[7.25rem] tracking-[-0.03em] [font-variation-settings:'SOFT'_100,'opsz'_144]">
                    <SplitWords text="Varanasi boat rides," delay={0.35} inView={false} className="block" />
                    <SplitWords text="without the haggling." delay={0.6} inView={false} className="block italic" wordClassName={() => "text-fire pr-[0.06em]"} />
                </h1>

                <div className="mt-8 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
                    <motion.div initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE, delay: 1.1 }}>
                        <p className="max-w-xl text-lg md:text-xl leading-relaxed text-white/75">
                            <strong className="font-semibold text-white">Pay a genuine price for comfort</strong> — a private boat and a trusted local boatman, at one fixed price from <span className="text-marigold font-semibold">{money(BOAT_PRICE_RANGE.low, currency)}</span>.
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row gap-3">
                            <Magnetic>
                                <Link href="/book" className="btn-sheen group h-14 px-8 inline-flex w-full sm:w-auto items-center justify-center gap-3 rounded-full bg-gradient-to-r from-marigold via-fire to-ember text-night text-lg font-semibold shadow-[0_10px_50px_-10px_rgba(255,122,26,0.8)] transition-shadow hover:shadow-[0_10px_60px_-6px_rgba(255,122,26,1)]">
                                    Book a boat ride
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-night text-marigold transition-transform duration-500 group-hover:rotate-[-45deg]"><ArrowRight size={16} /></span>
                                </Link>
                            </Magnetic>
                            <Link href="#rides" className="h-14 px-8 inline-flex items-center justify-center rounded-full border border-white/25 text-white font-medium backdrop-blur-sm transition-colors hover:bg-white hover:text-night">
                                See rides &amp; prices
                            </Link>
                        </div>
                    </motion.div>

                    {/* Rotating badge → rides */}
                    <motion.a href="#rides" aria-label="Scroll to the rides" className="group relative hidden md:flex h-32 w-32 items-center justify-center"
                        initial={reduce ? false : { opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, ease: EASE, delay: 1.4 }}>
                        <svg viewBox="0 0 100 100" className="spin-slow absolute inset-0 h-full w-full text-white/70">
                            <defs><path id="hero-ring" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" /></defs>
                            <text fontSize="8.5" letterSpacing="2.6" fill="currentColor"><textPath href="#hero-ring">THE RIVER IS WAITING · SCROLL · </textPath></text>
                        </svg>
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors group-hover:bg-marigold group-hover:text-night"><ArrowDown size={18} /></span>
                    </motion.a>
                </div>

                <motion.ul className="mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 border-t border-white/10 text-sm text-white/70"
                    initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 1.5 }}>
                    {TRUST.map((t, i) => (
                        <li key={t} className={`flex items-center gap-3 py-4 ${i % 2 ? "pl-4 md:pl-6" : "md:pl-6 md:first:pl-0"} ${i > 0 ? "md:border-l border-white/10" : ""} ${i === 1 ? "border-l md:border-l" : ""} ${i === 3 ? "border-l" : ""}`}>
                            <span className="font-display italic text-marigold">0{i + 1}</span>{t}
                        </li>
                    ))}
                </motion.ul>
            </motion.div>

        </section>
    );
}
