"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpen, MessageCircle } from "lucide-react";
import { SplitWords, Magnetic } from "@/components/motion/primitives";
import DiyaRiver from "@/components/motion/DiyaRiver";
import Embers from "@/components/motion/Embers";
import { GuaranteeStamp } from "@/components/home/Hero";

// The home hero for the festival season. Swap back to <Hero /> in app/page.tsx after Dev Deepawali.
const EASE = [0.16, 1, 0.3, 1] as const;
// Kartik Purnima, Tuesday 24 November 2026 — the ghats are lit from dusk (see the blog's festival guide).
const LIGHTING_AT = Date.parse("2026-11-24T17:15:00+05:30");
const FESTIVAL_ENDS = Date.parse("2026-11-25T00:00:00+05:30");
const WHATSAPP = "918175966910";
const WA_TEXT = "Namaste KashiGo! I'd like a private boat for Dev Deepawali (24 Nov 2026). We are __ people.";
const TRUST = ["Private boat for the lighting", "Trusted local boatman", "Price agreed upfront", "100% money-back guarantee"];

// Time left until the lamps are lit, ticking every second. Client-only, so the static HTML never bakes in a stale count.
function useCountdown() {
    const [left, setLeft] = useState<number | null>(null);
    useEffect(() => {
        const tick = () => setLeft(LIGHTING_AT - Date.now());
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);
    return left;
}

function Countdown({ reduce }: { reduce: boolean }) {
    const left = useCountdown();
    if (left === null) return <div className="h-[4.5rem]" />;
    if (left <= 0) {
        return (
            <p className="inline-flex items-center gap-2 rounded-full bg-marigold/15 px-4 py-2 text-marigold font-semibold">
                {left > LIGHTING_AT - FESTIVAL_ENDS ? "The ghats are lit tonight — call us for a boat" : "Thank you for celebrating Dev Deepawali with us"}
            </p>
        );
    }
    const s = Math.floor(left / 1000);
    const parts: [string, number][] = [["Days", Math.floor(s / 86400)], ["Hours", Math.floor(s / 3600) % 24], ["Mins", Math.floor(s / 60) % 60], ["Secs", s % 60]];
    return (
        <div className="flex items-stretch gap-2 sm:gap-3" aria-label={`${parts[0][1]} days to Dev Deepawali`}>
            {parts.map(([label, n]) => (
                <div key={label} className="w-16 sm:w-[4.75rem] rounded-2xl border border-marigold/25 bg-night/45 py-2 text-center backdrop-blur-md shadow-[0_0_30px_-12px_rgba(255,182,39,0.7)]">
                    <motion.span key={n} className="block font-display text-2xl sm:text-3xl leading-none text-white tabular-nums"
                        initial={reduce ? false : { y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35, ease: EASE }}>
                        {String(n).padStart(2, "0")}
                    </motion.span>
                    <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-marigold/80">{label}</span>
                </div>
            ))}
        </div>
    );
}

// A row of clay diyas along the foot of the hero, lit one after another as the page opens.
function DiyaRow({ reduce }: { reduce: boolean }) {
    const n = 22;
    return (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-0 flex justify-between px-2 opacity-90">
            {Array.from({ length: n }, (_, i) => (
                <motion.svg key={i} viewBox="0 0 40 40" className={`h-7 w-7 sm:h-9 sm:w-9 ${i % 2 ? "hidden sm:block" : ""}`}
                    initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: EASE, delay: 1.6 + Math.abs(i - n / 2) * 0.07 }}>
                    <defs>
                        <radialGradient id={`dg${i}`} cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#ffd27a" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#ff7a1a" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                    <circle cx="20" cy="18" r="16" fill={`url(#dg${i})`} className="flicker" style={{ animationDelay: `${(i * 0.37) % 2.6}s` }} />
                    <path d="M8 28 Q20 38 32 28 Z" fill="#a3431a" />
                    <ellipse cx="20" cy="28" rx="12" ry="2.6" fill="#d9622a" />
                    <path d="M18 26 Q20 12 22 26 Z" fill="#ffe2a0" className="flicker" style={{ animationDelay: `${(i * 0.53) % 2.6}s` }} />
                </motion.svg>
            ))}
        </div>
    );
}

export default function DevDeepawaliHero() {
    const ref = useRef<HTMLElement>(null);
    const reduce = !!useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
    const bgY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "20%"]);
    const textY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-28%"]);
    const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
    const devaY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "40%"]);

    return (
        <section ref={ref} className="grain relative isolate overflow-hidden bg-night min-h-[100svh] flex flex-col justify-end pt-28 md:pt-32 pb-10">
            {/* The ghats on Kartik Purnima under the full moon, with a slow push-in. */}
            <motion.div aria-hidden className="absolute inset-0 -z-30" style={{ y: bgY }}>
                <motion.div className="relative h-full w-full"
                    initial={reduce ? false : { scale: 1.2, opacity: 0 }} animate={{ scale: reduce ? 1 : [1.2, 1.04, 1.1], opacity: 1 }}
                    transition={reduce ? undefined : { scale: { duration: 26, times: [0, 0.12, 1], ease: "easeOut" }, opacity: { duration: 2 } }}>
                    <Image src="/dev-deepawali/ghats-full-moon.jpg" alt="" fill priority sizes="100vw" className="object-cover object-[35%_60%]" />
                </motion.div>
            </motion.div>
            <div aria-hidden className="absolute inset-0 -z-20 bg-[radial-gradient(120%_85%_at_15%_100%,rgba(7,11,24,0.94)_12%,rgba(7,11,24,0.5)_55%,rgba(7,11,24,0.12)_100%)]" />
            <div aria-hidden className="absolute inset-0 -z-20 bg-gradient-to-t from-night via-night/10 to-night/70" />
            <DiyaRiver className="-z-10" />
            {/* Moonlight from the top right and a warm lamp glow off the river */}
            <motion.div aria-hidden className="absolute -right-24 -top-24 -z-10 h-[55vh] w-[55vh] rounded-full bg-[radial-gradient(circle,rgba(255,236,200,0.28),transparent_65%)]"
                animate={reduce ? undefined : { opacity: [0.7, 1, 0.7], scale: [1, 1.06, 1] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} />
            <div aria-hidden className="flicker absolute -bottom-40 left-1/2 -z-10 h-[50vh] w-[110vw] -translate-x-1/2 rounded-[100%] bg-fire/30 blur-[120px]" />
            <Embers className="-z-10" density={1.3} />

            {/* देव दीपावली — huge and faint, behind everything */}
            <motion.p aria-hidden style={{ y: devaY }}
                className="pointer-events-none absolute right-[-6vw] top-[12vh] -z-10 select-none whitespace-nowrap font-deva text-[26vw] md:text-[15vw] leading-none text-transparent [-webkit-text-stroke:1px_rgba(255,182,39,0.24)]"
                initial={reduce ? false : { opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 2.2, ease: EASE, delay: 0.3 }}>
                देव दीपावली
            </motion.p>

            <motion.div style={{ y: textY, opacity: textOpacity }} className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6">
                <motion.div className="relative flex flex-wrap items-center gap-x-4 gap-y-3"
                    initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}>
                    <GuaranteeStamp reduce={reduce} />
                    <span className="inline-flex items-center gap-2.5 rounded-full border border-marigold/30 bg-night/40 py-1.5 pl-2 pr-4 text-xs text-white/85 backdrop-blur-md">
                        <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-fire/25">
                            <span className="absolute h-full w-full animate-ping rounded-full bg-fire/40" />
                            <span className="h-2 w-2 rounded-full bg-marigold" />
                        </span>
                        <span><b className="font-semibold text-marigold">Dev Deepawali 2026</b> <span className="text-white/55">·<span className="hidden sm:inline"> Kartik Purnima ·</span></span> Tue 24 Nov</span>
                    </span>
                </motion.div>

                <h1 className="mt-6 max-w-5xl font-display font-light text-white text-[3rem] leading-[0.95] sm:text-7xl lg:text-[7rem] tracking-[-0.03em] [font-variation-settings:'SOFT'_100,'opsz'_144]">
                    <SplitWords text="The night the gods" delay={0.35} inView={false} className="block" />
                    <SplitWords text="light up Kashi." delay={0.6} inView={false} className="block italic"
                        wordClassName={() => "bg-gradient-to-r from-marigold via-fire to-ember bg-clip-text text-transparent pr-[0.08em]"} />
                </h1>

                <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                    <motion.div initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE, delay: 1.1 }}>
                        <p className="max-w-xl text-lg md:text-xl leading-relaxed text-white/75">
                            On Kartik Purnima, all 84 ghats glow with <strong className="font-semibold text-white">over a million diyas</strong>. Watch it from your own private boat with a trusted local boatman — booked early, at an honest price agreed upfront.
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row gap-3">
                            <Magnetic>
                                <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WA_TEXT)}`} target="_blank" rel="noopener"
                                    className="btn-sheen group h-14 px-7 inline-flex w-full sm:w-auto items-center justify-center gap-3 rounded-full bg-gradient-to-r from-marigold via-fire to-ember text-night text-base sm:text-lg font-semibold whitespace-nowrap shadow-[0_10px_50px_-10px_rgba(255,122,26,0.8)] transition-shadow hover:shadow-[0_10px_60px_-6px_rgba(255,122,26,1)]">
                                    <MessageCircle size={20} /> Reserve a Dev Deepawali boat
                                </a>
                            </Magnetic>
                            <Link href="/book" className="group h-14 px-7 inline-flex items-center justify-center gap-2 rounded-full border border-white/25 text-white font-medium backdrop-blur-sm transition-colors hover:bg-white hover:text-night">
                                Book a ride this week <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                        <p className="mt-5 flex flex-wrap items-center gap-x-2 text-sm text-white/55">
                            <span>Festival boats are usually gone by early November.</span>
                            <Link href="/blog/dev-deepawali-2026-varanasi-guide" className="inline-flex items-center gap-1.5 text-white/80 underline decoration-marigold/60 underline-offset-4 hover:text-marigold">
                                <BookOpen size={14} /> A local&apos;s Dev Deepawali guide
                            </Link>
                        </p>
                    </motion.div>

                    <motion.div className="flex flex-col gap-3 lg:items-end"
                        initial={reduce ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE, delay: 1.3 }}>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">Until the lamps are lit</p>
                        <Countdown reduce={reduce} />
                    </motion.div>
                </div>

                <motion.ul className="mt-12 md:mt-14 mb-6 grid grid-cols-2 md:grid-cols-4 border-t border-white/10 text-sm text-white/70"
                    initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 1.5 }}>
                    {TRUST.map((t, i) => (
                        <li key={t} className={`flex items-center gap-3 py-4 ${i % 2 ? "pl-4 md:pl-6 border-l" : ""} ${i === 2 ? "md:pl-6 md:border-l" : ""} border-white/10`}>
                            <span className="font-display italic text-marigold">0{i + 1}</span>{t}
                        </li>
                    ))}
                </motion.ul>
            </motion.div>

            <DiyaRow reduce={reduce} />
        </section>
    );
}
