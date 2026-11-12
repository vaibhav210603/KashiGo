"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ArrowRight, Check, Ship, Sparkles, Video } from "lucide-react";
import { inr } from "@/lib/boatRides";
import { CONSULT_ONLY_INR, CONSULT_ONLY_MINUTES, COMBO_FROM_INR, COMBO_WORTH_INR, FREE_CALL_MINUTES, LONGER_MEET_INR, RIDE_FROM_INR } from "@/lib/combo";
import { EXPERTS } from "@/lib/experts";
import { Boat } from "@/components/home/DevDeepawali";

const GOLD = "#e8c158";

// Laptops and up get the scroll fan-out; phones get a short, still layout.
const desktopQuery = "(min-width: 768px)";
const subscribeDesktop = (cb: () => void) => { const m = window.matchMedia(desktopQuery); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); };
const useDesktop = () => useSyncExternalStore(subscribeDesktop, () => window.matchMedia(desktopQuery).matches, () => false);

// Two identical periods side by side, so a -50% slide loops without a seam.
function wave(amp: number, y: number, len = 240) {
    let d = `M0 ${y}`;
    for (let x = 0; x < 2880; x += len) d += ` q${len / 4} ${-amp} ${len / 2} 0 t${len / 2} 0`;
    return `${d} V200 H0 Z`;
}

const PLANETS = [
    { r: 22, size: 10, color: "#ffd36b", dur: 16 },
    { r: 32, size: 8, color: "#9ecbff", dur: 24 },
    { r: 42, size: 9, color: "#ff8a5c", dur: 34 },
    { r: 50, size: 13, color: "#f3d27a", dur: 46 },
];
// The text variation selector keeps phones from drawing the zodiac as emoji.
const ZODIAC = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"].map((z) => `${z}︎`);
// Deterministic glitter, so the server and the browser draw the same thing.
const GLITTER = Array.from({ length: 26 }, (_, i) => ({ left: (i * 37 + 11) % 100, dur: 7 + ((i * 5) % 7), delay: -((i * 1.9) % 12), size: 2 + (i % 3), gold: i % 3 !== 0 }));

// The section's moving backdrop: the sky above (a turning zodiac wheel with planets on their orbits, glyphs drifting,
// glitter falling) that melts into the Ganga below, where boats ride the waves under the cards.
function SkyAndRiver() {
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#07081c_0%,#140f36_28%,#2a1a2e_50%,#1a2350_68%,#0c2160_84%,#08163f_100%)]" />

            {/* The zodiac wheel and the planets, centred above the heading */}
            <div className="absolute left-1/2 top-[-16rem] aspect-square w-[34rem] [--wheel:34rem] md:[--wheel:54rem] -translate-x-1/2 md:top-[-22rem] md:w-[54rem]">
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,182,39,0.16)_0%,transparent_60%)]" />
                <div className="spin-slow absolute inset-0" style={{ animationDuration: "90s" }}>
                    <div className="absolute inset-[4%] rounded-full border border-[#e8c158]/20" />
                    <div className="absolute inset-[10%] rounded-full border border-dashed border-[#e8c158]/15" />
                    {ZODIAC.map((z, i) => (
                        <span key={i} className="absolute left-1/2 top-1/2 -ml-3 -mt-3 w-6 text-center text-lg leading-6 text-[#f3d27a]/55 md:text-2xl"
                            style={{ transform: `rotate(${i * 30}deg) translateY(calc(-1 * 0.43 * var(--wheel, 34rem)))` }}>{z}</span>
                    ))}
                </div>
                <div className="glow-pulse absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#fff3c4_0%,#ffb627_40%,transparent_70%)] md:h-24 md:w-24" />
                {PLANETS.map((p, i) => (
                    <div key={i} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: `${p.r * 2}%`, height: `${p.r * 2}%` }}>
                        <div className="absolute inset-0 rounded-full border border-white/[0.07]" />
                        <div className="spin-slow absolute inset-0" style={{ animationDuration: `${p.dur}s`, animationDirection: i % 2 ? "reverse" : "normal" }}>
                            <span className="absolute left-1/2 top-0 rounded-full" style={{ width: p.size, height: p.size, marginLeft: -p.size / 2, marginTop: -p.size / 2, background: p.color, boxShadow: `0 0 14px ${p.color}` }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Planet glyphs and Om drifting up */}
            {["ॐ", "♄", "♀", "☿", "✦", "♃", "☽", "✦"].map((g, i) => (
                <span key={i} className="astro-float absolute font-deva text-xl text-[#f3d27a]/45 md:text-2xl" style={{ left: `${6 + i * 12}%`, top: `${8 + (i % 3) * 10}%`, animationDelay: `${-i * 1.6}s` }}>{g}</span>
            ))}

            {/* Glitter falling from the sky */}
            {GLITTER.map((g, i) => (
                <div key={i} className="glitter-fall absolute top-0 h-full" style={{ left: `${g.left}%`, animationDuration: `${g.dur}s`, animationDelay: `${g.delay}s` }}>
                    <span className="twinkle block rotate-45" style={{ width: g.size, height: g.size, background: g.gold ? "#ffd36b" : "#fff", boxShadow: `0 0 ${g.size * 3}px ${g.gold ? "#ffb627" : "#fff"}`, animationDelay: `${-i * 0.37}s` }} />
                </div>
            ))}

            {/* The river under the cards: lamp light on the water, waves and the boats */}
            <div className="absolute inset-x-0 bottom-0 h-44 md:h-56">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#123077]/80 to-[#08163f]" />
                <div className="shimmer absolute inset-x-[8%] top-[30%] h-10 bg-[radial-gradient(ellipse_at_center,rgba(255,180,80,0.28),transparent_70%)] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
                <svg className="wave-drift-slow absolute left-0 top-[34%] h-20 w-[200%]" viewBox="0 0 2880 200" preserveAspectRatio="none">
                    <path d={wave(12, 60)} fill="#1b4296" opacity="0.6" />
                </svg>
                <div className="drift-across absolute bottom-[26%] left-0 h-16 w-36 md:h-20 md:w-48" style={{ animationDuration: "38s", animationDelay: "-12s" }}>
                    <div className="bob h-full w-full"><Boat /></div>
                </div>
                <div className="bob absolute bottom-[10%] right-[6%] h-14 w-32 md:h-16 md:w-40" style={{ animationDuration: "5.5s" }}><Boat flip /></div>
                <svg className="wave-drift absolute bottom-0 left-0 h-16 w-[200%] [animation-direction:reverse]" viewBox="0 0 2880 200" preserveAspectRatio="none">
                    <path d={wave(14, 70, 320)} fill="#08163f" />
                </svg>
            </div>
        </div>
    );
}

const Tick = ({ children, tone = "text-marigold" }: { children: React.ReactNode; tone?: string }) => (
    <li className="flex gap-2"><Check size={15} className={`mt-0.5 shrink-0 ${tone}`} />{children}</li>
);

const Tag = ({ children }: { children: React.ReactNode }) => (
    <span className="absolute left-2.5 top-2.5 rounded-full bg-night/70 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white/90 backdrop-blur md:left-3 md:top-3 md:px-2.5 md:py-1 md:text-[10px]">{children}</span>
);

// A: the boat ride. B: a session alone (the decoy). Same shape, so they sit side by side on a phone.
function SideCard({ kind }: { kind: "ride" | "consult" }) {
    const ride = kind === "ride";
    return (
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#0d1030]/85 backdrop-blur-sm md:rounded-[1.75rem]">
            <div className="relative aspect-[4/3] md:aspect-[16/10]">
                {/* eslint-disable-next-line @next/next/no-img-element -- static photo / animated GIF */}
                <img src={ride ? "/gallery/ghats-from-boat-warm.jpg" : "/consult/meet-guru.gif"} alt={ride ? "The ghats of Varanasi seen from a KashiGo boat" : "A guru on Google Meet, a Lo Shu grid and a kundali"}
                    loading="lazy" className={`h-full w-full object-cover ${ride ? "object-[50%_30%]" : ""}`} />
                <span className="absolute inset-0 bg-gradient-to-t from-[#0d1030] via-transparent to-transparent" />
                <Tag>{ride ? "For sightseeing" : "For life questions"}</Tag>
            </div>
            <div className="flex flex-1 flex-col p-3 pt-1 md:p-5 md:pt-2">
                <p className="inline-flex items-center gap-1.5 text-sm font-semibold leading-tight md:gap-2 md:text-base">
                    {ride ? <Ship size={16} className="shrink-0 text-marigold" /> : <Video size={16} className="shrink-0 text-marigold" />}
                    {ride ? "Boat ride" : "1-on-1 with a guru"}
                </p>
                <p className="mt-1.5 font-display text-2xl leading-none md:mt-2 md:text-4xl" style={{ color: GOLD }}>
                    {ride && <span className="mr-1 font-sans text-[11px] font-medium text-white/60 md:text-sm">from</span>}
                    {inr(ride ? RIDE_FROM_INR : CONSULT_ONLY_INR)}
                </p>
                {ride
                    ? <p className="mt-1 text-[10px] leading-snug text-white/55 md:text-[11px]">Price per boat for 2 people. Adding more passengers raises the price.</p>
                    : <p className="mt-1 inline-flex items-center gap-1 text-[10px] text-white/60 md:text-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element -- small product icon */}
                        <img src="/consult/google-meet.svg" alt="" width={14} height={14} className="h-3.5 w-3.5" /> {CONSULT_ONLY_MINUTES}-min Google Meet
                    </p>}
                <ul className="mb-4 mt-3 hidden flex-1 content-start gap-2 text-sm text-white/75 md:grid">
                    {ride
                        ? <><Tick>A private boat for your group</Tick><Tick>Life jackets for everyone</Tick><Tick>Trusted local boatman</Tick></>
                        : <><Tick>A Vedic guru or a numerologist</Tick><Tick>Kundli, Lo Shu grid and remedies</Tick><Tick>From anywhere — phone or laptop</Tick></>}
                </ul>
                <Link href={ride ? "/book" : "/ride-and-consult?plan=consult"}
                    className="mt-3 inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-white/25 text-sm font-semibold transition-colors hover:border-marigold md:mt-auto md:h-12 md:text-base">
                    {ride ? "Book a ride" : "Book a session"} <ArrowRight size={15} />
                </Link>
            </div>
        </div>
    );
}

// C: the ride and a session together. The gold aura turns around the outside of the card.
function ComboCard() {
    return (
        <div className="relative h-full">
            <div aria-hidden className="combo-aura pointer-events-none absolute -inset-2 rounded-[2.4rem] opacity-80 blur-lg" />
            <div className="combo-ring relative h-full rounded-[1.75rem] p-[2px] shadow-[0_30px_90px_-25px_rgba(232,193,88,0.8)]">
                <div className="shine-loop relative flex h-full flex-col overflow-hidden rounded-[calc(1.75rem-2px)] bg-[radial-gradient(120%_70%_at_50%_0%,#3a2a10_0%,#1c1433_55%,#120d26_100%)] p-4 md:p-5">
                    <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white/90 md:text-[10px]">For the full Kashi experience</span>
                        <span className="rounded-full bg-[#7ee0c9] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-night md:text-[10px]">Best value</span>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                        <div className="flex shrink-0 -space-x-3">
                            {EXPERTS.map((e, i) => (
                                // eslint-disable-next-line @next/next/no-img-element -- small portraits
                                <img key={e.slug} src={e.icon} alt={e.name} width={56} height={56} loading="lazy"
                                    className="bob h-12 w-12 rounded-full border-2 border-[#e8c158] object-cover shadow-[0_0_20px_rgba(232,193,88,0.55)] md:h-14 md:w-14"
                                    style={{ animationDuration: `${4 + i}s`, animationDelay: `${-i * 1.3}s` }} />
                            ))}
                        </div>
                        <p className="text-[11px] leading-snug text-white/70">Talk to Badri Narayan ji, Maruti Kinkar Maharaj or Vibha</p>
                    </div>

                    <p className="mt-4 inline-flex items-center gap-2 font-semibold"><Ship size={18} className="text-marigold" /> + <Video size={18} className="text-marigold" /> Ride + guru combo</p>
                    <p className="mt-2 font-display text-4xl leading-none md:text-5xl" style={{ color: GOLD }}><span className="mr-1 font-sans text-sm font-medium text-white/60">starting at</span>{inr(COMBO_FROM_INR)}</p>
                    <p className="mt-1.5 text-xs text-white/65">Worth <s>{inr(COMBO_WORTH_INR)}</s> · just {inr(COMBO_FROM_INR - CONSULT_ONLY_INR)} more than a session alone</p>
                    <ul className="mt-4 grid flex-1 content-start gap-2 text-sm text-white/90">
                        <Tick tone="text-[#7ee0c9]">Your private boat ride on the Ganga</Tick>
                        <Tick tone="text-[#7ee0c9]">A 30-min Google Meet with a guru (45 min for +{inr(LONGER_MEET_INR)})</Tick>
                        <Tick tone="text-[#7ee0c9]">A free {FREE_CALL_MINUTES}-minute call first</Tick>
                    </ul>
                    <Link href="/ride-and-consult" className="btn-sheen mt-5 flex h-14 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-marigold via-fire to-ember text-lg font-extrabold text-night shadow-[0_14px_40px_-12px_rgba(255,122,26,0.9)]">
                        <Sparkles size={18} /> Build my combo <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </div>
    );
}

// On a laptop the three cards start stacked behind the combo and fan out as the section scrolls in:
// the side cards slide out, tilt and then float.
function FanCard({ side, progress, children }: { side: -1 | 1; progress: MotionValue<number>; children: React.ReactNode }) {
    const x = useTransform(progress, [0, 1], [`${-side * 100}%`, "0%"]);
    const rotate = useTransform(progress, [0, 1], [0, side * 5]);
    const y = useTransform(progress, [0, 1], [10, 34]);
    const scale = useTransform(progress, [0, 1], [0.86, 0.96]);
    const opacity = useTransform(progress, [0, 0.35, 1], [0, 0.85, 1]);
    return (
        <motion.div style={{ x, rotate, y, scale, opacity, zIndex: 0 }} className="relative h-full">
            <div className="float-y h-full" style={{ animationDelay: side < 0 ? "0s" : "-2.5s" }}>{children}</div>
        </motion.div>
    );
}

// Three offers (lib/combo.ts): the ride, a session alone, and both together for barely more than the session.
// The session alone is the decoy — it makes the combo, in the middle, the obvious pick.
export default function RideConsultOffer() {
    const section = useRef<HTMLElement>(null);
    const stage = useRef<HTMLDivElement>(null);
    const desktop = useDesktop();
    const reduce = !!useReducedMotion();
    const { scrollYProgress } = useScroll({ target: stage, offset: ["start 0.95", "start 0.3"] });

    // Stop every loop while the section is off screen.
    useEffect(() => {
        const el = section.current;
        if (!el) return;
        const io = new IntersectionObserver(([e]) => el.classList.toggle("anim-paused", !e.isIntersecting));
        io.observe(el);
        return () => io.disconnect();
    }, []);

    const fan = desktop && !reduce;
    return (
        <section ref={section} id="ride-and-consult" className="relative isolate scroll-mt-16 overflow-hidden pb-40 pt-14 text-white md:pb-64 md:pt-24">
            <SkyAndRiver />
            <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
                <p className="text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-marigold">Combo packages</p>
                <h2 className="mt-3 text-center font-display text-4xl font-light leading-[1.05] tracking-[-0.02em] sm:text-6xl">Ride the Ganga. <em className="text-fire">Ask a guru.</em></h2>
                <p className="mx-auto mt-3 max-w-xl text-center text-sm text-white/70 md:text-base">A private boat on the river, a live Google Meet with a Kashi guru — or both together for barely more than one.</p>

                {fan ? (
                    <div ref={stage} className="mt-16 grid grid-cols-[1fr_1.12fr_1fr] items-stretch gap-6">
                        <FanCard side={-1} progress={scrollYProgress}><SideCard kind="ride" /></FanCard>
                        <div className="relative z-10"><ComboCard /></div>
                        <FanCard side={1} progress={scrollYProgress}><SideCard kind="consult" /></FanCard>
                    </div>
                ) : (
                    // Phones: the combo first, then the ride and the session side by side — one short scroll.
                    <div ref={stage} className="mt-8">
                        <ComboCard />
                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <SideCard kind="ride" />
                            <SideCard kind="consult" />
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
