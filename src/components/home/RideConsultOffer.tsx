"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
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

// Planets sit on their orbits and turn with the zodiac wheel — one rotating layer for the whole sky.
const PLANETS = [
    { r: 22, angle: 40, size: 11, color: "radial-gradient(circle at 35% 30%,#fff3c4,#e8a23a)" },
    { r: 31, angle: 200, size: 8, color: "radial-gradient(circle at 35% 30%,#e6f1ff,#6f9ad6)" },
    { r: 40, angle: 120, size: 9, color: "radial-gradient(circle at 35% 30%,#ffd2bd,#c8562f)" },
    { r: 49, angle: 290, size: 14, color: "radial-gradient(circle at 35% 30%,#fff0cc,#c79a3b)" },
];
// The text variation selector keeps phones from drawing the zodiac as emoji.
const ZODIAC = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"].map((z) => `${z}︎`);
const STARS = [[6, 14], [14, 32], [22, 8], [31, 24], [44, 12], [57, 30], [66, 9], [74, 22], [83, 14], [92, 30], [10, 48], [88, 46], [38, 40], [62, 44]];

// The section's backdrop: night sky continuing from the hero, a slowly turning zodiac wheel above the heading,
// and the Ganga with a boat under the cards, fading into the rides below. Four cheap loops in all.
function Backdrop() {
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#070b18_0%,#0d0f2a_22%,#171338_45%,#1a1640_62%,#0f1c4a_80%,#070b18_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(60%_35%_at_50%_18%,rgba(232,193,88,0.14),transparent_70%),radial-gradient(50%_30%_at_50%_58%,rgba(255,150,50,0.10),transparent_70%)]" />
            {STARS.map(([l, t], i) => (
                <span key={i} className="absolute rounded-full bg-white" style={{ left: `${l}%`, top: `${t}%`, width: i % 3 ? 2 : 3, height: i % 3 ? 2 : 3, opacity: 0.35 + (i % 4) * 0.12 }} />
            ))}

            <div className="absolute left-1/2 top-[-6rem] aspect-square w-[30rem] -translate-x-1/2 [--wheel:30rem] md:top-[-13rem] md:w-[50rem] md:[--wheel:50rem]">
                <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#fff3c4_0%,#ffb627_38%,rgba(255,182,39,0.18)_62%,transparent_72%)] md:h-32 md:w-32" />
                {PLANETS.map((p, i) => (
                    <div key={i} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#e8c158]/12" style={{ width: `${p.r * 2}%`, height: `${p.r * 2}%` }} />
                ))}
                <div className="spin-slow absolute inset-0" style={{ animationDuration: "160s" }}>
                    <div className="absolute inset-[4%] rounded-full border border-[#e8c158]/20" />
                    <div className="absolute inset-[9%] rounded-full border border-dashed border-[#e8c158]/15" />
                    {ZODIAC.map((z, i) => (
                        <span key={i} className="absolute left-1/2 top-1/2 -ml-3 -mt-3 w-6 text-center text-lg leading-6 text-[#f3d27a]/55 md:text-2xl"
                            style={{ transform: `rotate(${i * 30 + 15}deg) translateY(calc(-0.435 * var(--wheel)))` }}>{z}</span>
                    ))}
                    {PLANETS.map((p, i) => (
                        <span key={i} className="absolute left-1/2 top-1/2 rounded-full" style={{
                            width: p.size, height: p.size, marginLeft: -p.size / 2, marginTop: -p.size / 2, background: p.color, boxShadow: "0 0 12px rgba(255,200,100,0.5)",
                            transform: `rotate(${p.angle}deg) translateY(calc(-${p.r / 100} * var(--wheel)))`,
                        }} />
                    ))}
                </div>
            </div>

            {/* The river under the cards, fading into the rides section below */}
            <div className="absolute inset-x-0 bottom-0 h-52 md:h-64">
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(18,48,119,0.45)_35%,rgba(15,42,106,0.7)_55%,#070b18_92%)]" />
                <div className="absolute inset-x-[15%] top-[32%] h-8 bg-[radial-gradient(ellipse_at_center,rgba(255,190,90,0.35),transparent_70%)]" />
                <svg className="wave-drift-slow absolute left-0 top-[36%] h-16 w-[200%]" viewBox="0 0 2880 200" preserveAspectRatio="none">
                    <path d={wave(10, 70)} fill="#1b4296" opacity="0.3" />
                </svg>
                <div className="boat-cruise absolute left-0 top-[26%] h-14 w-32 md:h-20 md:w-44"><Boat /></div>
                <svg className="absolute bottom-0 left-0 h-20 w-full" viewBox="0 0 1440 200" preserveAspectRatio="none">
                    <path d={wave(12, 80, 360)} fill="#070b18" />
                </svg>
            </div>
        </div>
    );
}

const Tick = ({ children, tone }: { children: React.ReactNode; tone: string }) => (
    <li className="flex gap-2"><Check size={15} className={`mt-0.5 shrink-0 ${tone}`} />{children}</li>
);

const Tag = ({ children, tone = "bg-night/80 text-white/90" }: { children: React.ReactNode; tone?: string }) => (
    <span className={`absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide md:left-3 md:top-3 md:px-2.5 md:py-1 md:text-[10px] ${tone}`}>{children}</span>
);

// A: the boat ride (a green glow and border). B: a session alone (the decoy). Side by side on a phone.
function SideCard({ kind }: { kind: "ride" | "consult" }) {
    const ride = kind === "ride";
    return (
        <div className={`flex h-full flex-col overflow-hidden rounded-2xl bg-[#0e1130] md:rounded-[1.75rem] ${ride ? "border-2 border-emerald-400/80 shadow-[0_0_30px_2px_rgba(16,185,129,0.35)]" : "border border-white/12"}`}>
            <div className="relative aspect-[4/3] md:aspect-[16/10]">
                {/* eslint-disable-next-line @next/next/no-img-element -- static photo / animated GIF */}
                <img src={ride ? "/gallery/ghats-from-boat-warm.jpg" : "/consult/meet-guru.gif"} alt={ride ? "The ghats of Varanasi seen from a KashiGo boat" : "A guru on Google Meet, a Lo Shu grid and a kundali"}
                    loading="lazy" className={`h-full w-full object-cover ${ride ? "object-[50%_30%]" : ""}`} />
                <span className="absolute inset-0 bg-gradient-to-t from-[#0e1130] via-transparent to-transparent" />
                <Tag tone={ride ? "bg-emerald-500 text-white" : undefined}>{ride ? "For sightseeing" : "For life questions"}</Tag>
            </div>
            <div className="flex flex-1 flex-col p-3 pt-1 md:p-5 md:pt-2">
                <p className="inline-flex items-center gap-1.5 text-sm font-semibold leading-tight text-white md:gap-2 md:text-base">
                    {ride ? <Ship size={16} className="shrink-0 text-emerald-400" /> : <Video size={16} className="shrink-0 text-marigold" />}
                    {ride ? "Boat ride" : "1-on-1 with a guru"}
                </p>
                <p className="mt-1.5 font-display text-2xl leading-none md:mt-2 md:text-4xl" style={{ color: GOLD }}>
                    {ride && <span className="mr-1 font-sans text-[11px] font-medium text-white/55 md:text-sm">from</span>}
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
                        ? <><Tick tone="text-emerald-400">A private boat for your group</Tick><Tick tone="text-emerald-400">Life jackets for everyone</Tick><Tick tone="text-emerald-400">Trusted local boatman</Tick></>
                        : <><Tick tone="text-marigold">A Vedic guru or a numerologist</Tick><Tick tone="text-marigold">Kundli, Lo Shu grid and remedies</Tick><Tick tone="text-marigold">From anywhere — phone or laptop</Tick></>}
                </ul>
                <Link href={ride ? "/book" : "/ride-and-consult?plan=consult"}
                    className={`mt-3 inline-flex h-10 items-center justify-center gap-1.5 rounded-full text-sm font-semibold transition-colors md:mt-auto md:h-12 md:text-base ${ride ? "bg-emerald-500 text-night hover:bg-emerald-400" : "border border-white/25 text-white hover:border-marigold"}`}>
                    {ride ? "Book a ride" : "Book a session"} <ArrowRight size={15} />
                </Link>
            </div>
        </div>
    );
}

// C: the ride and a session together — the gold card in the middle. Its glow and border are static; one sheen passes now and then.
function ComboCard() {
    return (
        <div className="relative h-full rounded-[1.75rem] bg-[linear-gradient(140deg,#f9e29a,#b8862a_30%,#f3d27a_55%,#8a6418_80%,#f9e29a)] p-[2px] shadow-[0_0_70px_6px_rgba(232,193,88,0.35),0_40px_80px_-30px_rgba(0,0,0,0.8)]">
            <div className="shine-loop relative flex h-full flex-col overflow-hidden rounded-[calc(1.75rem-2px)] bg-[radial-gradient(120%_70%_at_50%_0%,#3a2a10_0%,#1c1433_55%,#120d26_100%)] p-4 text-white md:p-6">
                <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white/90 md:text-[10px]">For the full Kashi experience</span>
                    <span className="rounded-full bg-[#7ee0c9] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-night md:text-[10px]">Best value</span>
                </div>

                <div className="mt-4 flex items-center gap-3">
                    <div className="flex shrink-0 -space-x-3">
                        {EXPERTS.map((e) => (
                            // eslint-disable-next-line @next/next/no-img-element -- small portraits
                            <img key={e.slug} src={e.icon} alt={e.name} width={56} height={56} loading="lazy"
                                className="h-12 w-12 rounded-full border-2 border-[#e8c158] object-cover md:h-14 md:w-14" />
                        ))}
                    </div>
                    <p className="text-[11px] leading-snug text-white/70">Talk to Badri Narayan ji, Maruti Kinkar Maharaj or Vibha</p>
                </div>

                <p className="mt-5 inline-flex items-center gap-2 font-semibold"><Ship size={18} className="text-marigold" /> + <Video size={18} className="text-marigold" /> Ride + guru combo</p>
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
    );
}

// On a laptop the side cards start tucked behind the combo and glide out once as the section scrolls in.
function FanCard({ side, progress, children }: { side: -1 | 1; progress: MotionValue<number>; children: React.ReactNode }) {
    const x = useTransform(progress, [0, 1], [`${-side * 105}%`, "0%"]);
    const scale = useTransform(progress, [0, 1], [0.86, 0.96]);
    const opacity = useTransform(progress, [0, 0.3, 1], [0, 0.9, 1]);
    return <motion.div style={{ x, scale, opacity }} className="relative h-full">{children}</motion.div>;
}

// Three offers (lib/combo.ts): the ride, a session alone, and both together for barely more than the session.
// The session alone is the decoy — it makes the combo, in the middle, the obvious pick.
export default function RideConsultOffer() {
    const section = useRef<HTMLElement>(null);
    const stage = useRef<HTMLDivElement>(null);
    const desktop = useDesktop();
    const reduce = !!useReducedMotion();
    const { scrollYProgress } = useScroll({ target: stage, offset: ["start 0.95", "start 0.4"] });
    const progress = useSpring(scrollYProgress, { stiffness: 110, damping: 26, restDelta: 0.002 });

    // Stop the loops while the section is off screen.
    useEffect(() => {
        const el = section.current;
        if (!el) return;
        const io = new IntersectionObserver(([e]) => el.classList.toggle("anim-paused", !e.isIntersecting));
        io.observe(el);
        return () => io.disconnect();
    }, []);

    const fan = desktop && !reduce;
    return (
        <section ref={section} id="ride-and-consult" className="relative isolate scroll-mt-16 overflow-hidden pb-48 pt-20 text-white md:pb-64 md:pt-32">
            <Backdrop />
            <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
                <p className="text-center text-[11px] font-semibold uppercase tracking-[0.32em] text-marigold">Ride + guru combo</p>
                <h2 className="mx-auto mt-3 max-w-3xl text-center font-display text-[2.6rem] font-light leading-[1.02] tracking-[-0.02em] sm:text-6xl">
                    One evening on the Ganga. <em className="text-fire">A lifetime of answers.</em>
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-center text-sm text-white/65 md:text-base">Sail past the ghats in your own boat, then sit face to face with a Kashi guru on Google Meet — both for barely more than one.</p>

                {fan ? (
                    <div ref={stage} className="mt-16 grid grid-cols-[1fr_1.12fr_1fr] items-center gap-6">
                        <FanCard side={-1} progress={progress}><SideCard kind="ride" /></FanCard>
                        <div className="relative z-10"><ComboCard /></div>
                        <FanCard side={1} progress={progress}><SideCard kind="consult" /></FanCard>
                    </div>
                ) : (
                    // Phones: the combo first, then the ride and the session side by side — one short scroll.
                    <div ref={stage} className="mt-10">
                        <ComboCard />
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <SideCard kind="ride" />
                            <SideCard kind="consult" />
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
