"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { animate, motion, useInView, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ArrowDown, ArrowRight, BadgeCheck, BadgeIndianRupee, Eye, LifeBuoy, Loader2, Lock, Play, Plus, ShieldCheck, Ticket, TrendingUp, UserCheck } from "lucide-react";
import DiyaRiver from "@/components/motion/DiyaRiver";
import { Countdown, FestivalFilm, FillingFast, InvitationSeal, RiverScene, SeatPacks } from "@/components/home/DevDeepawali";
import { inr, istNow } from "@/lib/boatRides";
import { money, useCurrency } from "@/lib/currency";
import { AMENITIES, BEST_PRICE_LINE, DD_MAX_PEOPLE, DD_PACKS, DEV_DEEPAWALI_LABEL, GHAT_PRICE_INR, THIRD_SEAT_INR, ddSplit, ddTotal, seatPrices, trioPrice, type DdPay } from "@/lib/devDeepawali";
import { goToThankYou } from "@/lib/thankYou";
import { track } from "@/lib/analytics";

// Dev Deepawali, told in the order a visitor decides: the night and today's price (first screen) → why it's worth it
// (the story, scrolled through) → what to buy (the seat packs, Trio in the middle) → why now (the price ladder) →
// why us (proof and the guarantee) → the form. Every scroll effect is a transform or opacity.
const GOLD = "#e8c158";
const AMENITY_ICONS = [Ticket, Eye, LifeBuoy, UserCheck, BadgeIndianRupee, ShieldCheck];
const EASE = [0.16, 1, 0.3, 1] as const;

// India "today", re-read every minute. Empty on the server, so the static page never bakes in a stale price.
const subscribe = (tick: () => void) => { const t = setInterval(tick, 60_000); return () => clearInterval(t); };
const useIstToday = () => useSyncExternalStore(subscribe, () => istNow().iso, () => "");
const fmtDay = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
const goBook = () => document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "start" });

const loadRazorpay = () =>
    new Promise<void>((resolve, reject) => {
        if ((window as any).Razorpay) return resolve();
        const s = document.createElement("script");
        s.src = "https://checkout.razorpay.com/v1/checkout.js";
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Could not load Razorpay. Check your connection and try again."));
        document.body.appendChild(s);
    });
const post = (body: object) => fetch("/api/dev-deepawali", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json());

// Rises into place the first time it scrolls into view.
function Reveal({ children, delay = 0, y = 28, className = "" }: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
    const reduce = useReducedMotion();
    return (
        <motion.div className={className} initial={reduce ? false : { opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -12% 0px" }} transition={{ duration: 0.9, ease: EASE, delay }}>
            {children}
        </motion.div>
    );
}

function Label({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
    return (
        <p className={`flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] ${center ? "justify-center" : ""}`} style={{ color: GOLD }}>
            <span aria-hidden className="h-px w-8 bg-gradient-to-r from-transparent to-current" />{children}<span aria-hidden className="h-px w-8 bg-gradient-to-l from-transparent to-current" />
        </p>
    );
}

// Fireworks over the hero: bursts of spark lines that bloom and fade (CSS only, see .burst in globals.css).
const BURSTS = [
    { left: "14%", top: "14%", size: 150, color: "#ffd27a", delay: 0 },
    { left: "78%", top: "9%", size: 180, color: "#ff8fd6", delay: 1.1 },
    { left: "52%", top: "20%", size: 110, color: "#9fd8ff", delay: 2.1 },
    { left: "90%", top: "30%", size: 100, color: "#ffb347", delay: 2.9 },
];
function Fireworks() {
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            {BURSTS.map((b, i) => (
                <span key={i} className="burst absolute" style={{ left: b.left, top: b.top, width: b.size, height: b.size, marginLeft: -b.size / 2, animationDelay: `${b.delay}s`, animationDuration: `${3 + (i % 3) * 0.5}s` }}>
                    {Array.from({ length: 14 }, (_, k) => (
                        <i key={k} style={{ transform: `translateX(-50%) rotate(${k * (360 / 14)}deg)`, background: `linear-gradient(to top, transparent, ${b.color})`, boxShadow: `0 0 6px ${b.color}` }} />
                    ))}
                </span>
            ))}
        </div>
    );
}

// ── 1. First screen: the night, the date, today's price against the ghat's, one button ──
function Hero({ price, currency }: { price: number; currency: string }) {
    const ref = useRef<HTMLElement>(null);
    const reduce = !!useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
    const imgScale = useTransform(scrollYProgress, [0, 1], [1.06, 1.22]);
    const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
    const textY = useTransform(scrollYProgress, [0, 1], [0, -90]);
    const textOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
    const words = ["Dev", "Deepawali,"];

    return (
        <section ref={ref} className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden pb-12 pt-28 md:pb-16">
            <motion.div aria-hidden className="absolute inset-0 -z-30" style={reduce ? undefined : { scale: imgScale, y: imgY }}>
                <picture>
                    <source media="(min-width: 768px)" srcSet="/dev-deepawali/ghats-night-desktop.jpg" />
                    <img src="/dev-deepawali/diya-steps-tall.jpg" alt="" fetchPriority="high" decoding="async" className="h-full w-full object-cover" />
                </picture>
            </motion.div>
            <div aria-hidden className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(7,11,24,0.55)_0%,rgba(7,11,24,0.25)_35%,rgba(7,11,24,0.85)_78%,#070b18_100%)]" />
            <div aria-hidden className="absolute inset-0 -z-20 bg-[radial-gradient(80%_50%_at_50%_100%,rgba(255,140,40,0.28),transparent_70%)]" />
            <div className="-z-10"><Fireworks /></div>
            <DiyaRiver className="-z-10" />

            <motion.div style={reduce ? undefined : { y: textY, opacity: textOpacity }} className="relative mx-auto w-full max-w-5xl px-4 text-center sm:px-6">
                <motion.p initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }}
                    className="inline-flex items-center gap-2 rounded-full border border-[#e8c158]/40 bg-night/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-[#f3d27a] backdrop-blur-sm">
                    Kartik Purnima · {DEV_DEEPAWALI_LABEL} 2026
                </motion.p>
                <h1 className="mt-5 font-display text-[2.85rem] font-light leading-[0.92] tracking-[-0.035em] text-white sm:text-8xl lg:text-[8.5rem]">
                    {words.map((w, i) => (
                        <motion.span key={w} className="inline-block pr-[0.22em]" initial={reduce ? false : { opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease: EASE, delay: 0.15 + i * 0.12 }}>{w}</motion.span>
                    ))}
                    <motion.em className="block text-fire" initial={reduce ? false : { opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease: EASE, delay: 0.45 }}>from the river.</motion.em>
                </h1>
                <motion.p initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.8 }} className="mx-auto mt-5 max-w-lg text-base text-white/80 sm:text-lg">
                    A million diyas on 84 ghats, the grand aarti and fireworks over the Ganga — watched from your seat on the water.
                </motion.p>

                <motion.div initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 1 }} className="mt-7 flex flex-col items-center gap-4">
                    <p className="font-display text-2xl text-white sm:text-3xl">
                        <s className="mr-2 font-sans text-base text-white/45 decoration-[#ff6b6b] decoration-2 sm:text-lg">{inr(GHAT_PRICE_INR)}</s>
                        <span style={{ color: GOLD }}>{price ? inr(price) : " "}</span>
                        <span className="ml-1.5 font-sans text-sm text-white/65">per person today{price && currency === "usd" ? ` · ≈ ${money(price, "usd").replace(/\.\d+$/, "")}` : ""}</span>
                    </p>
                    <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
                        <button onClick={() => { track("dd_cta", { from: "hero" }); document.getElementById("seats")?.scrollIntoView({ behavior: "smooth" }); }}
                            className="btn-sheen inline-flex h-14 w-full items-center justify-center gap-2 rounded-full border border-[#f3d27a] bg-gradient-to-b from-[#f9e29a] to-[#d6a332] px-10 text-lg font-bold text-[#0a1c52] shadow-[0_12px_40px_-8px_rgba(232,193,88,0.9)] sm:w-auto">
                            Reserve my seats <ArrowDown size={18} />
                        </button>
                        <a href="#film" className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full border border-white/25 bg-night/30 px-7 font-medium text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-night sm:w-auto">
                            <Play size={16} className="text-marigold" /> Watch the night
                        </a>
                    </div>
                    <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-white/65">
                        <span className="inline-flex items-center gap-1.5"><ShieldCheck size={13} className="text-[#7ee0c9]" /> 100% money-back</span>
                        <span className="inline-flex items-center gap-1.5"><LifeBuoy size={13} className="text-[#7ee0c9]" /> Life jackets</span>
                        <span className="inline-flex items-center gap-1.5"><BadgeIndianRupee size={13} className="text-[#7ee0c9]" /> Pay 50% at the ghat</span>
                    </p>
                </motion.div>
                <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.3 }} className="mx-auto mt-7 max-w-sm"><Countdown /></motion.div>
            </motion.div>
        </section>
    );
}

// ── 2. The scale of the night, counted up as it comes into view ──
function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const seen = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
    useEffect(() => {
        const el = ref.current;
        if (!seen || !el) return;
        const c = animate(0, to, { duration: 2.2, ease: EASE, onUpdate: (v) => { el.textContent = `${Math.round(v).toLocaleString("en-IN")}${suffix}`; } });
        return () => c.stop();
    }, [seen, to, suffix]);
    return <span ref={ref}>0{suffix}</span>;
}

function Facts() {
    const facts: [number, string, string][] = [[10, " lakh+", "diyas on the steps"], [84, "", "ghats lit end to end"], [1, "", "night a year"]];
    return (
        <section className="relative border-y border-white/10 bg-night py-10 md:py-14">
            <div className="mx-auto grid max-w-5xl grid-cols-3 gap-3 px-4 text-center sm:px-6">
                {facts.map(([n, s, l], i) => (
                    <Reveal key={l} delay={i * 0.1}>
                        <p className="font-display text-4xl leading-none sm:text-6xl" style={{ color: GOLD }}><CountUp to={n} suffix={s} /></p>
                        <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-white/55 sm:text-xs">{l}</p>
                    </Reveal>
                ))}
            </div>
        </section>
    );
}

// ── 3. The night, scrolled through: the section pins and three moments cross-fade ──
const CHAPTERS = [
    { img: "/dev-deepawali/diya-steps-wide.jpg", time: "5:15 PM", title: "The first diya is lit.", text: "Then thousands more, step after step, until every ghat glows." },
    { img: "/dev-deepawali/ghats-night-desktop.jpg", time: "6:30 PM", title: "Kashi turns to gold.", text: "Eighty-four ghats shine along the river, and the grand aarti begins." },
    { img: "/dev-deepawali/ghats-full-moon.jpg", time: "7:30 PM", title: "Fireworks over the Ganga.", text: "Under the Kartik full moon — and you see it all from your seat on the water." },
];

function Chapter({ i, p, c }: { i: number; p: MotionValue<number>; c: (typeof CHAPTERS)[number] }) {
    const n = CHAPTERS.length;
    const a = i / n, b = (i + 1) / n;
    const first = i === 0, last = i === n - 1;
    const opacity = useTransform(p, first ? [0, b - 0.06, b + 0.02] : last ? [a - 0.06, a + 0.02, 1] : [a - 0.06, a + 0.02, b - 0.06, b + 0.02], first ? [1, 1, 0] : last ? [0, 1, 1] : [0, 1, 1, 0]);
    const scale = useTransform(p, [a - 0.15, b + 0.1], [1.18, 1]);
    const textY = useTransform(p, [a - 0.05, a + 0.08, b - 0.08, b], first ? [0, 0, 0, -40] : last ? [50, 0, 0, 0] : [50, 0, 0, -40]);
    return (
        <motion.div className="absolute inset-0" style={{ opacity }}>
            <motion.div className="absolute inset-0" style={{ scale }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- full-bleed photo */}
                <img src={c.img} alt="" loading="lazy" className="h-full w-full object-cover" />
            </motion.div>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,24,0.55)_0%,rgba(7,11,24,0.15)_40%,rgba(7,11,24,0.9)_100%)]" />
            <motion.div style={{ y: textY }} className="absolute inset-x-0 bottom-[14%] mx-auto max-w-3xl px-6 text-center">
                <p className="text-sm font-semibold tracking-[0.3em] text-[#f3d27a]">{c.time}</p>
                <h3 className="mt-3 font-display text-5xl font-light leading-[1] tracking-[-0.02em] text-white sm:text-7xl">{c.title}</h3>
                <p className="mx-auto mt-4 max-w-md text-base text-white/80 sm:text-lg">{c.text}</p>
            </motion.div>
        </motion.div>
    );
}

function NightStory() {
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
    const bar = useTransform(scrollYProgress, [0, 1], [0, 1]);
    return (
        <section ref={ref} aria-label="Dev Deepawali night" className="relative h-[300vh] bg-night">
            <div className="sticky top-0 h-[100svh] overflow-hidden">
                {CHAPTERS.map((c, i) => <Chapter key={c.time} i={i} p={scrollYProgress} c={c} />)}
                <div className="absolute left-1/2 top-24 w-56 -translate-x-1/2">
                    <div className="h-[2px] w-full overflow-hidden rounded-full bg-white/20">
                        <motion.div className="h-full origin-left bg-[#e8c158]" style={{ scaleX: bar }} />
                    </div>
                    <p className="mt-2 text-center text-[10px] uppercase tracking-[0.3em] text-white/60">The night of 24 Nov</p>
                </div>
            </div>
        </section>
    );
}

// ── 4. What to buy: Trio in the middle, raised and glowing; Solo and Pair beside it ──
function PackCard({ people, seat, onPick }: { people: number; seat: number; onPick: (n: number) => void }) {
    const pack = DD_PACKS.find((p) => p.people === people)!;
    const trio = people === 3;
    const total = ddTotal(seat, people);
    return (
        <div className={`relative h-full ${trio ? "md:z-10 md:scale-[1.05]" : ""}`}>
            {trio && <div aria-hidden className="glow-breathe pointer-events-none absolute inset-0 rounded-[2rem] shadow-[0_0_70px_14px_rgba(232,193,88,0.4)]" />}
            <div className={`relative flex h-full flex-col overflow-hidden rounded-[1.5rem] p-4 text-center sm:p-7 md:rounded-[1.75rem] ${trio ? "border-2 border-[#e8c158] bg-[radial-gradient(120%_80%_at_50%_0%,#2a2a6e_0%,#121a4a_55%,#0b1236_100%)]" : "border border-white/12 bg-white/[0.04]"}`}>
                {trio && <span className="shine-loop pointer-events-none absolute inset-0" aria-hidden />}
                {trio && <span className="mx-auto mb-3 rounded-full bg-[#7ee0c9] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-night">Best value</span>}
                <p className={`font-display text-white ${trio ? "text-4xl" : "text-2xl sm:text-4xl"}`}>{pack.name}</p>
                <p className="text-sm text-white/55">{pack.line}</p>
                <p className={`mt-4 font-display leading-none tabular-nums md:mt-5 ${trio ? "text-5xl" : "text-[1.75rem] sm:text-5xl"}`} style={{ color: GOLD }}>{seat ? inr(total) : " "}</p>
                <p className={`mt-2 text-xs font-semibold sm:text-sm ${trio ? "text-[#7ee0c9]" : "text-white/55"}`}>
                    {!seat ? " " : trio ? `${inr(Math.round(total / 3))} per person` : people === 2 ? `${inr(seat)} × 2` : "per person"}
                </p>
                <p className="mt-1 text-[11px] text-white/40 sm:text-xs">On the ghat: <s>{inr(GHAT_PRICE_INR * people)}</s></p>
                <span className="block h-6 shrink-0" />
                {trio && seat > 0 && <p className="-mt-3 mb-6 text-xs text-white/75">The 3rd seat is just {inr(THIRD_SEAT_INR)} — you save {inr(seat * 3 - trioPrice(seat))}</p>}
                <button type="button" onClick={() => onPick(people)}
                    className={`mt-auto inline-flex h-11 w-full shrink-0 items-center justify-center gap-1.5 rounded-full text-sm font-bold transition-colors sm:h-12 sm:text-base ${trio ? "border border-[#f3d27a] bg-gradient-to-b from-[#f9e29a] to-[#d6a332] text-[#0a1c52] shadow-[0_10px_30px_-10px_rgba(232,193,88,0.9)]" : "border border-white/25 text-white hover:border-[#e8c158]"}`}>
                    Choose {pack.name} <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
}

function Seats({ seat, ladder, onPick }: { seat: number; ladder: { iso: string; inDays: number; inr: number }[]; onPick: (n: number) => void }) {
    return (
        <section id="seats" className="relative scroll-mt-16 overflow-hidden bg-[radial-gradient(70%_50%_at_50%_0%,#13205a_0%,#070b18_70%)] py-16 md:py-28">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <Reveal><Label center>Your seats on the river</Label></Reveal>
                <Reveal delay={0.08}><h2 className="mt-4 text-center font-display text-4xl font-light leading-[1.02] tracking-[-0.02em] text-white sm:text-6xl">Come together. <em className="text-fire">Pay less each.</em></h2></Reveal>
                <Reveal delay={0.14}><p className="mx-auto mt-4 max-w-lg text-center text-white/65">A seat on a KashiGo shared boat, priced per person. Local boatmen ask {inr(GHAT_PRICE_INR)} each on the night.</p></Reveal>

                {/* Phones: Trio first and full width, Solo and Pair side by side under it */}
                <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3 md:items-stretch md:gap-5">
                    <Reveal delay={0.1} className="col-span-2 md:order-2 md:col-span-1"><PackCard people={3} seat={seat} onPick={onPick} /></Reveal>
                    <Reveal delay={0.2} className="md:order-1"><PackCard people={1} seat={seat} onPick={onPick} /></Reveal>
                    <Reveal delay={0.3} className="md:order-3"><PackCard people={2} seat={seat} onPick={onPick} /></Reveal>
                </div>
                <Reveal delay={0.1}><p className="mt-6 text-center text-sm text-white/55">More than 3? Every 3 seats are charged at the Trio price — pick the number in the form.</p></Reveal>

                {/* ── 5. Why now: the price ladder, drawn as a line that fills in ── */}
                {ladder.length > 1 && (
                    <Reveal delay={0.1} className="mx-auto mt-16 max-w-3xl">
                        <p className="flex items-center justify-center gap-2 text-sm font-semibold text-[#ffc2c2]"><TrendingUp size={16} /> The price rises ₹200 every 2 days until the festival</p>
                        <div className="relative mt-8">
                            <div className="absolute left-[10%] right-[10%] top-[9px] h-[2px] bg-white/10" />
                            <motion.div className="absolute left-[10%] right-[10%] top-[9px] h-[2px] origin-left bg-gradient-to-r from-[#e8c158] to-[#ff6b6b]"
                                initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.6, ease: EASE, delay: 0.2 }} />
                            <ol className="relative grid grid-cols-[repeat(var(--m),minmax(0,1fr))] sm:grid-cols-[repeat(var(--n),minmax(0,1fr))]" style={{ ["--m" as string]: Math.min(3, ladder.length), ["--n" as string]: ladder.length }}>
                                {ladder.map((p, i) => (
                                    <li key={p.iso} className={`flex-col items-center text-center ${i > 2 ? "hidden sm:flex" : "flex"}`}>
                                        <span className={`h-5 w-5 rounded-full border-2 ${i === 0 ? "border-[#e8c158] bg-[#e8c158] shadow-[0_0_16px_rgba(232,193,88,0.9)]" : "border-white/30 bg-night"}`} />
                                        <span className={`mt-3 text-[10px] font-bold uppercase tracking-wider sm:text-[11px] ${i === 0 ? "text-[#f3d27a]" : "text-white/50"}`}>{i === 0 ? "Today" : p.inDays === 1 ? "Tomorrow" : fmtDay(p.iso)}</span>
                                        <span className={`font-display text-lg sm:text-2xl ${i === 0 ? "text-white" : "text-white/55"}`}>{inr(p.inr)}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                        <div className="mt-6 flex justify-center"><span className="rounded-full bg-[#d7191f]/15 px-4 py-2 ring-1 ring-[#ff4d4d]/40"><FillingFast /></span></div>
                    </Reveal>
                )}
            </div>
        </section>
    );
}

// ── 6. Why us: real guests on a KashiGo boat, and what every seat includes ──
function Proof() {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
    return (
        <section className="relative overflow-hidden bg-night py-20 md:py-28">
            <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 md:grid-cols-2 md:gap-14">
                <Reveal>
                    <div ref={ref} className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-white/10">
                        <motion.div className="absolute inset-[-10%]" style={{ y }}>
                            {/* eslint-disable-next-line @next/next/no-img-element -- photo of our guests */}
                            <img src="/gallery/group-aarti-boat.jpg" alt="KashiGo guests in life jackets on the Ganga at night" loading="lazy" className="h-full w-full object-cover" />
                        </motion.div>
                        <span className="absolute bottom-3 left-3 rounded-full bg-night/75 px-3 py-1 text-xs text-white/85">Our guests at the evening aarti</span>
                    </div>
                </Reveal>
                <div>
                    <Reveal><Label>Included with every seat</Label></Reveal>
                    <Reveal delay={0.08}><h2 className="mt-4 font-display text-4xl font-light leading-[1.05] tracking-[-0.02em] text-white sm:text-5xl">Nothing to bargain. <em className="text-fire">Nothing to worry about.</em></h2></Reveal>
                    <ul className="mt-7 grid gap-3">
                        {AMENITIES.map((a, i) => {
                            const Icon = AMENITY_ICONS[i % AMENITY_ICONS.length];
                            return (
                                <Reveal key={a.title} delay={0.05 * i} y={16}>
                                    <li className="flex gap-3.5">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8c158]/12 text-[#f3d27a] ring-1 ring-[#e8c158]/30"><Icon size={18} /></span>
                                        <span><span className="block font-semibold text-white">{a.title}</span><span className="block text-sm text-white/60">{a.detail}</span></span>
                                    </li>
                                </Reveal>
                            );
                        })}
                    </ul>
                    <Reveal delay={0.2}><p className="mt-6 text-sm text-white/55">The guarantee in full: <Link href="/policies#guarantee" className="text-marigold underline underline-offset-4">our policy</Link></p></Reveal>
                </div>
            </div>
        </section>
    );
}

// ── 7. For anyone who wants to see more before booking ──
function Film() {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
    const scale = useTransform(scrollYProgress, [0, 1], [0.86, 1]);
    const reduce = !!useReducedMotion();
    return (
        <section id="film" className="relative scroll-mt-16 bg-gradient-to-b from-night via-[#0a1846] to-night py-20 md:py-28">
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
                <Reveal><Label center>Watch the night</Label></Reveal>
                <Reveal delay={0.08}><h2 className="mt-4 text-center font-display text-4xl font-light leading-[1.05] tracking-[-0.02em] text-white sm:text-5xl">See the night <em className="text-fire">for yourself.</em></h2></Reveal>
                <motion.div ref={ref} style={reduce ? undefined : { scale }} className="mt-10">
                    <FestivalFilm />
                </motion.div>
                <p className="mt-3 text-center text-xs text-white/45">Fireworks, the laser show and the lit ghats · film by Shrunal Waigankar, on YouTube</p>
            </div>
        </section>
    );
}

export default function DevDeepawaliClient() {
    const today = useIstToday();
    const [currency] = useCurrency();
    const ladder = today ? seatPrices(today, 5) : [];
    const price = ladder[0]?.inr ?? 0;
    const tomorrow = ladder[1]?.inDays === 1 ? ladder[1].inr : undefined;
    const [people, setPeople] = useState(3);

    // Arriving from the home page with a head count (/dev-deepawali?people=4#book). Read after hydration,
    // since the page itself is prerendered without the query.
    useEffect(() => {
        const n = Number(new URLSearchParams(window.location.search).get("people"));
        if (!(n >= 1)) return;
        const t = setTimeout(() => setPeople(Math.min(DD_MAX_PEOPLE, Math.trunc(n))), 0);
        return () => clearTimeout(t);
    }, []);

    const pick = (n: number) => { track("dd_cta", { from: "packs", people: n }); setPeople(n); goBook(); };

    return (
        <div className="w-full bg-night text-white">
            <Hero price={price} currency={currency} />
            <Facts />
            <NightStory />
            <Seats seat={price} ladder={ladder} onPick={pick} />
            <Proof />
            <Film />
            <BookingForm price={price} tomorrow={tomorrow} people={people} setPeople={setPeople} />

            {/* ── Questions ── */}
            <section className="py-16 md:py-20">
                <div className="mx-auto max-w-3xl px-4 sm:px-6">
                    <Label center>Questions</Label>
                    <div className="mt-8 divide-y divide-white/10 rounded-[1.5rem] border border-white/10 bg-white/[0.03]">
                        {[
                            ["Where and when do we board?", "We call you after you book to confirm your boarding ghat and reporting time for Tuesday 24 November. The lighting begins at dusk, so plan to be on the ghat in the late afternoon."],
                            ["Can I pay part now and the rest later?", "Yes — choose “50% now, 50% at the ghat” when you book. You pay half online now and the rest to your KashiGo boatman at the ghat, in cash or UPI. Nobody else."],
                            ["Is this a private boat?", "It's a seat on a KashiGo shared boat. For a private boat for your group on Dev Deepawali night, call or WhatsApp +91 81759 66910."],
                            ["What if the ride can't happen?", <>If we can&apos;t give you the ride you booked, our <Link href="/policies#guarantee" className="text-marigold underline underline-offset-4">100% money-back guarantee</Link> applies: every rupee you paid comes back.</>],
                        ].map(([q, a]) => (
                            <details key={String(q)} className="group p-5 sm:p-6">
                                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">{q}<Plus size={18} className="shrink-0 text-marigold transition-transform group-open:rotate-45" /></summary>
                                <p className="mt-3 leading-relaxed text-white/70">{a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

// Passenger details → full or 50% → Razorpay. The server prices the order; the totals here are a preview.
function BookingForm({ price, tomorrow, people, setPeople }: { price: number; tomorrow?: number; people: number; setPeople: (n: number) => void }) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [others, setOthers] = useState<string[]>(["", ""]);
    // One name field per extra passenger, kept in step with the head count (which the seat cards above can change).
    if (others.length !== people - 1) setOthers(Array.from({ length: people - 1 }, (_, i) => others[i] ?? ""));
    const [pay, setPay] = useState<DdPay>("full");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const formRef = useRef<HTMLFormElement>(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = formRef.current;
        if (!el) return;
        const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
        io.observe(el);
        return () => io.disconnect();
    }, []);

    const setCount = (n: number) => setPeople(Math.max(1, Math.min(DD_MAX_PEOPLE, n)));
    const total = ddTotal(price, people);
    const split = ddSplit(total, pay);
    const input = "h-12 w-full rounded-xl border border-white/15 bg-white/[0.05] px-4 text-base text-white placeholder:text-white/35 outline-none transition-colors focus:border-marigold";

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (name.trim().length < 2) return setError("Add the lead passenger's name.");
        if (phone.replace(/\D/g, "").length < 8) return setError("Add a phone number so we can call you with your boarding details.");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Add your email — your confirmation goes there.");
        if (others.some((o) => !o.trim())) return setError("Add a name for every passenger.");
        setBusy(true);
        try {
            track("begin_checkout", { currency: "INR", value: split.online, item_id: "dev-deepawali", payment_type: pay === "advance" ? "razorpay_advance" : "razorpay" });
            const o = await post({ action: "order", name, phone, email, people, passengers: others, pay });
            if (!o.success) throw new Error(o.message);
            await loadRazorpay();
            const rzp = new (window as any).Razorpay({
                key: o.keyId, order_id: o.orderId, amount: o.amount, currency: "INR",
                name: "KashiGo", description: `Dev Deepawali · ${people} seat${people === 1 ? "" : "s"}${o.dueInr ? " · 50% advance" : ""}`,
                image: "https://kashigo.in/icon-192.png", prefill: { name, email, contact: phone }, theme: { color: "#f97316" },
                handler: async (r: any) => {
                    // Razorpay has the money by now: land on /thank-you even if our check fails, and say so.
                    const v = await post({ action: "verify", ...r }).catch(() => ({ success: false }));
                    track("purchase", { transaction_id: o.booking, currency: "INR", value: o.onlineInr, item_id: "dev-deepawali" });
                    goToThankYou({
                        title: v.success ? "You're going to Dev Deepawali!" : "Payment received!",
                        message: v.success
                            ? `Confirmation sent to ${email}. We'll call you on ${phone} with your boarding ghat and time.${o.dueInr ? ` Pay the remaining ${inr(o.dueInr)} to your KashiGo boatman at the ghat — nobody else.` : ""}`
                            : "We couldn't confirm it automatically. Please WhatsApp +91 81759 66910 with your payment ID and we'll confirm your seats.",
                        ref: { label: "Booking", value: o.booking },
                        rows: [["Event", "Dev Deepawali · Tue 24 Nov 2026"], ["Seats", String(people)], ["Paid online", inr(o.onlineInr)], ...(o.dueInr ? [["Due at the ghat", inr(o.dueInr)]] as [string, string][] : []), ["Payment ID", r.razorpay_payment_id]],
                        cta: { label: "Back to Dev Deepawali", href: "/dev-deepawali" },
                    });
                },
                modal: { ondismiss: () => setBusy(false) },
            });
            rzp.on("payment.failed", (r: any) => { setError(r?.error?.description || "Payment failed. No money was taken — please try again."); setBusy(false); });
            rzp.open();
        } catch (err: any) {
            setError(err?.message || "Something went wrong — please try again.");
            setBusy(false);
        }
    };

    return (
        <section id="book" className="relative scroll-mt-16 overflow-hidden bg-gradient-to-b from-night via-[#0a1846] to-[#0c1f58] pb-72 pt-16 md:pt-24">
            <RiverScene />
            <div className="relative mx-auto max-w-2xl px-4 sm:px-6">
                <Reveal className="text-center">
                    <InvitationSeal />
                    <p className="mt-4 text-sm font-semibold uppercase tracking-[0.25em] text-white/60">Book your seats for</p>
                    <h2 className="mt-1 font-display text-5xl font-light leading-none tracking-[-0.02em] sm:text-6xl" style={{ color: GOLD }}>24 November 2026</h2>
                    <p className="mt-2 text-white/75">Tuesday · Dev Deepawali evening · KashiGo shared boat</p>
                </Reveal>

                <Reveal delay={0.1}>
                <form ref={formRef} onSubmit={submit} className="relative mt-8 rounded-[2rem] border-2 bg-gradient-to-b from-[#12348f] to-[#0a1c52] p-5 shadow-[0_40px_100px_-30px_rgba(40,100,255,0.7)] sm:p-8" style={{ borderColor: GOLD }}>
                    {/* 1 — who's coming */}
                    <p className="flex items-center gap-2.5 text-sm font-bold uppercase tracking-[0.18em]" style={{ color: GOLD }}><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e8c158] text-xs text-[#0a1c52]">1</span> Passenger details</p>
                    <div className="mt-5"><SeatPacks seat={price} people={people} onPick={setCount} compact /></div>
                    <div className="mt-4 grid gap-3">
                        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Lead passenger's full name" autoComplete="name" className={input} />
                        <div className="grid gap-3 sm:grid-cols-2">
                            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone / WhatsApp" type="tel" inputMode="tel" autoComplete="tel" className={input} />
                            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (for your confirmation)" type="email" autoComplete="email" className={input} />
                        </div>
                        {others.map((o, i) => (
                            <input key={i} value={o} onChange={(e) => setOthers((xs) => xs.map((x, j) => (j === i ? e.target.value : x)))} placeholder={`Passenger ${i + 2} — full name`} className={input} />
                        ))}
                    </div>

                    {/* 2 — how to pay */}
                    <p className="mt-8 flex items-center gap-2.5 text-sm font-bold uppercase tracking-[0.18em]" style={{ color: GOLD }}><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e8c158] text-xs text-[#0a1c52]">2</span> How would you like to pay?</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {([["full", "Pay in full", `${inr(total)} now`, "Nothing more to pay at the ghat"], ["advance", "50% now, 50% at the ghat", `${inr(ddSplit(total, "advance").online)} now`, `${inr(ddSplit(total, "advance").atGhat)} to your boatman, cash or UPI`]] as const).map(([id, title, now, sub]) => (
                            <button key={id} type="button" onClick={() => setPay(id)} aria-pressed={pay === id}
                                className={`rounded-2xl border-2 p-4 text-left transition-colors ${pay === id ? "border-[#e8c158] bg-[#e8c158]/15" : "border-white/15 bg-white/[0.03] hover:border-white/35"}`}>
                                <span className="flex items-center justify-between gap-2">
                                    <span className="font-semibold">{title}</span>
                                    <span className={`h-5 w-5 rounded-full border-2 ${pay === id ? "border-[#e8c158] bg-[#e8c158] shadow-[inset_0_0_0_3px_#0a1c52]" : "border-white/30"}`} />
                                </span>
                                <span className="mt-1 block font-display text-2xl" style={{ color: GOLD }}>{price ? now : " "}</span>
                                <span className="block text-xs text-white/60">{sub}</span>
                            </button>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="mt-6 space-y-1.5 rounded-2xl bg-night/40 p-4 text-sm">
                        <div className="flex justify-between text-white/70"><span>{people >= 3 ? `${people} seats (Trio price)` : `${inr(price)} × ${people} ${people === 1 ? "person" : "people"}`}</span><span className="tabular-nums">{inr(total)}</span></div>
                        <div className="flex justify-between text-white/45"><span>On the ghat that would be</span><s className="tabular-nums">{inr(GHAT_PRICE_INR * people)}</s></div>
                        <div className="flex justify-between border-t border-white/10 pt-2 text-base font-bold"><span>{pay === "advance" ? "Pay now (50%)" : "Pay now"}</span><span className="tabular-nums" style={{ color: GOLD }}>{inr(split.online)}</span></div>
                        {split.atGhat > 0 && <div className="flex justify-between text-white/70"><span>Due at the ghat</span><span className="tabular-nums">{inr(split.atGhat)}</span></div>}
                    </div>

                    {/* Urgency, right by the button */}
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 rounded-xl bg-[#d7191f]/15 px-3 py-2.5 text-center ring-1 ring-[#ff4d4d]/40">
                        <FillingFast />
                        {tomorrow && <span className="text-xs font-semibold text-[#ffc2c2]">Price goes up to {inr(tomorrow)} tomorrow</span>}
                    </div>
                    {error && <p role="alert" className="mt-4 rounded-xl bg-ember/15 px-4 py-3 text-sm font-medium text-[#ffb3a6]">{error}</p>}
                    <button type="submit" disabled={busy || !price}
                        className="btn-sheen mt-4 flex h-16 w-full items-center justify-center gap-2.5 rounded-full border border-[#f3d27a] bg-gradient-to-b from-[#f9e29a] to-[#d6a332] text-lg font-extrabold text-[#0a1c52] shadow-[0_14px_40px_-10px_rgba(232,193,88,0.95)] disabled:opacity-70">
                        {busy ? <Loader2 size={20} className="animate-spin" /> : <Lock size={18} />}
                        {busy ? "Opening secure checkout…" : `Book now · Pay ${inr(split.online)}`}
                    </button>
                    <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-white/55"><BadgeCheck size={13} className="text-[#7ee0c9]" /> {BEST_PRICE_LINE} · UPI, cards, net banking via Razorpay. We call you with your boarding ghat and time.</p>
                </form>
                </Reveal>
            </div>

            {/* Phones: a jump to the form while reading the page above it */}
            <div className={`fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-[#e8c158]/40 bg-[#0a1c52]/95 px-4 pb-[calc(0.625rem+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur transition-transform duration-300 sm:hidden ${inView ? "translate-y-full" : ""}`}>
                <div className="flex-1 leading-tight">
                    <p className="text-[11px] text-white/60">Dev Deepawali · per person <s className="ml-1 text-white/40">{inr(GHAT_PRICE_INR)}</s></p>
                    <p className="font-display text-xl" style={{ color: GOLD }}>{price ? inr(price) : " "}{price > 0 && <span className="ml-2 font-sans text-[11px] font-semibold text-[#7ee0c9]">Trio {inr(trioPrice(price))}</span>}</p>
                </div>
                <button onClick={goBook} className="h-11 rounded-full bg-gradient-to-b from-[#f9e29a] to-[#d6a332] px-6 text-sm font-extrabold text-[#0a1c52]">Book now</button>
            </div>
        </section>
    );
}
