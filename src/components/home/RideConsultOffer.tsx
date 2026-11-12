"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ArrowRight, Check, Ship, Sparkles, Video } from "lucide-react";
import { inr } from "@/lib/boatRides";
import { CONSULT_ONLY_INR, CONSULT_ONLY_MINUTES, COMBO_FROM_INR, COMBO_WORTH_INR, FREE_CALL_MINUTES, LONGER_MEET_INR, RIDE_FROM_INR } from "@/lib/combo";
import { EXPERTS } from "@/lib/experts";
import { Boat } from "@/components/home/DevDeepawali";

const GOLD = "#e8c158";      // gold on the dark combo card
const GOLD_INK = "#9a6b12";  // gold that reads on ivory
const INK = "#16122b";

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

// Each planet keeps its own pace, and speeds up and slows down along its orbit (an eased turn, not a linear one).
const PLANETS = [
    { r: 22, size: 11, color: "radial-gradient(circle at 35% 30%,#fff3c4,#e8a23a)", dur: 13, ease: "cubic-bezier(0.45,0.05,0.55,0.95)" },
    { r: 31, size: 8, color: "radial-gradient(circle at 35% 30%,#e6f1ff,#6f9ad6)", dur: 21, ease: "cubic-bezier(0.6,0.1,0.4,0.9)" },
    { r: 40, size: 9, color: "radial-gradient(circle at 35% 30%,#ffd2bd,#c8562f)", dur: 29, ease: "cubic-bezier(0.37,0,0.63,1)" },
    { r: 49, size: 15, color: "radial-gradient(circle at 35% 30%,#fff0cc,#c79a3b)", dur: 43, ease: "cubic-bezier(0.5,0.15,0.5,0.85)" },
];
// The text variation selector keeps phones from drawing the zodiac as emoji.
const ZODIAC = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"].map((z) => `${z}︎`);
// Deterministic glitter (same on server and browser): each flake falls at its own speed and sways at its own rate.
const GLITTER = Array.from({ length: 22 }, (_, i) => ({
    left: (i * 37 + 11) % 100, dur: 9 + ((i * 7) % 9), delay: -((i * 2.3) % 16), sway: 2.6 + ((i * 3) % 5) * 0.7, size: 3 + (i % 3) * 1.5,
}));

// The section's backdrop, on warm ivory: a gold zodiac wheel with planets above the heading, glitter drifting
// down, and the Ganga with its boats under the cards. Top and bottom fade into the dark sections around it.
function Backdrop() {
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[#fbf6ec]" />
            <div className="absolute inset-0 bg-[radial-gradient(70%_45%_at_50%_22%,#fff9ea_0%,transparent_70%),radial-gradient(60%_40%_at_85%_60%,rgba(232,193,88,0.12),transparent_70%),radial-gradient(60%_40%_at_10%_70%,rgba(126,224,201,0.10),transparent_70%)]" />

            {/* The zodiac wheel and planets, centred above the heading */}
            <div className="absolute left-1/2 top-[-3rem] aspect-square w-[30rem] -translate-x-1/2 [--wheel:30rem] md:top-[-11rem] md:w-[50rem] md:[--wheel:50rem]">
                <div className="spin-slow absolute inset-0" style={{ animationDuration: "140s" }}>
                    <div className="absolute inset-[4%] rounded-full border border-[#c9a24a]/30" />
                    <div className="absolute inset-[9%] rounded-full border border-dashed border-[#c9a24a]/25" />
                    {ZODIAC.map((z, i) => (
                        <span key={i} className="absolute left-1/2 top-1/2 -ml-3 -mt-3 w-6 text-center text-lg leading-6 text-[#b08a3a]/70 md:text-2xl"
                            style={{ transform: `rotate(${i * 30 + 15}deg) translateY(calc(-0.435 * var(--wheel)))` }}>{z}</span>
                    ))}
                </div>
                <div className="sun-breathe absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#fff6d8_0%,#ffcf6b_35%,rgba(255,182,39,0.25)_60%,transparent_72%)] md:h-28 md:w-28" />
                {PLANETS.map((p, i) => (
                    <div key={i} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: `${p.r * 2}%`, height: `${p.r * 2}%` }}>
                        <div className="absolute inset-0 rounded-full border border-[#c9a24a]/20" />
                        <div className="spin-slow absolute inset-0" style={{ animationDuration: `${p.dur}s`, animationTimingFunction: p.ease, animationDirection: i % 2 ? "reverse" : "normal" }}>
                            <span className="absolute left-1/2 top-0 rounded-full shadow-[0_2px_8px_rgba(120,80,20,0.35)]" style={{ width: p.size, height: p.size, marginLeft: -p.size / 2, marginTop: -p.size / 2, background: p.color }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Om and planet glyphs rising and fading, each at its own pace */}
            {["ॐ", "♄", "♀", "☿", "♃", "☽"].map((g, i) => (
                <span key={i} className="astro-float absolute font-deva text-xl text-[#b08a3a]/45 md:text-2xl"
                    style={{ left: `${8 + i * 16}%`, top: `${16 + (i % 3) * 9}%`, animationDuration: `${6 + (i % 3) * 2.2}s`, animationDelay: `${-i * 1.9}s` }}>{g}</span>
            ))}

            {/* Gold glitter: falls (speeding up as it drops), sways and twinkles */}
            {GLITTER.map((g, i) => (
                <div key={i} className="glitter-fall absolute top-0 h-full" style={{ left: `${g.left}%`, animationDuration: `${g.dur}s`, animationDelay: `${g.delay}s` }}>
                    <div className="glitter-sway" style={{ animationDuration: `${g.sway}s`, animationDelay: `${-i * 0.4}s` }}>
                        <span className="twinkle block" style={{ width: g.size, height: g.size, animationDuration: `${1.2 + (i % 4) * 0.45}s`, animationDelay: `${-i * 0.37}s` }} />
                    </div>
                </div>
            ))}

            {/* Fade in from the dark hero above */}
            <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,#070b18_0%,rgba(40,28,30,0.75)_35%,rgba(160,120,80,0.22)_70%,transparent_100%)] md:h-56" />

            {/* The river under the cards, deepening into the dark section below */}
            <div className="absolute inset-x-0 bottom-0 h-56 md:h-72">
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,#dbe9f6_22%,#9fbfe6_48%,#3d5fa8_70%,#070b18_100%)]" />
                <div className="water-glint absolute inset-x-[10%] top-[30%] h-10 bg-[radial-gradient(ellipse_at_center,rgba(255,214,140,0.55),transparent_70%)]" />
                <svg className="wave-drift-slow absolute left-0 top-[26%] h-16 w-[200%]" viewBox="0 0 2880 200" preserveAspectRatio="none">
                    <path d={wave(10, 70)} fill="#c4daf1" opacity="0.8" />
                </svg>
                <div className="boat-cruise absolute left-0 top-[24%] h-16 w-36 md:h-20 md:w-48">
                    <div className="boat-rock h-full w-full"><Boat /></div>
                </div>
                <svg className="wave-drift absolute left-0 top-[44%] h-20 w-[200%] [animation-direction:reverse]" viewBox="0 0 2880 200" preserveAspectRatio="none">
                    <path d={wave(12, 60, 320)} fill="#86a9dc" opacity="0.75" />
                </svg>
                <div className="boat-rock absolute right-[7%] top-[46%] h-14 w-32 md:h-16 md:w-40" style={{ animationDuration: "6.5s" }}><Boat flip /></div>
                <svg className="wave-drift-slow absolute bottom-0 left-0 h-24 w-[200%]" viewBox="0 0 2880 200" preserveAspectRatio="none">
                    <path d={wave(14, 60, 360)} fill="#070b18" />
                </svg>
            </div>
        </div>
    );
}

const Tick = ({ children, tone }: { children: React.ReactNode; tone: string }) => (
    <li className="flex gap-2"><Check size={15} className={`mt-0.5 shrink-0 ${tone}`} />{children}</li>
);

const Tag = ({ children, tone = "bg-white/90 text-[#16122b]" }: { children: React.ReactNode; tone?: string }) => (
    <span className={`absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide shadow-sm md:left-3 md:top-3 md:px-2.5 md:py-1 md:text-[10px] ${tone}`}>{children}</span>
);

// A: the boat ride (a green glow and border). B: a session alone (the decoy). Ivory cards; side by side on a phone.
function SideCard({ kind }: { kind: "ride" | "consult" }) {
    const ride = kind === "ride";
    return (
        <div className="relative h-full">
            {ride && <div aria-hidden className="glow-breathe pointer-events-none absolute inset-0 rounded-2xl shadow-[0_0_26px_6px_rgba(16,185,129,0.45)] md:rounded-[1.75rem] md:shadow-[0_0_36px_8px_rgba(16,185,129,0.42)]" />}
            <div className={`relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_50px_-24px_rgba(22,18,43,0.35)] md:rounded-[1.75rem] ${ride ? "border-2 border-emerald-500" : "border border-[#16122b]/10"}`}>
                <div className="relative aspect-[4/3] md:aspect-[16/10]">
                    {/* eslint-disable-next-line @next/next/no-img-element -- static photo / animated GIF */}
                    <img src={ride ? "/gallery/ghats-from-boat-warm.jpg" : "/consult/meet-guru.gif"} alt={ride ? "The ghats of Varanasi seen from a KashiGo boat" : "A guru on Google Meet, a Lo Shu grid and a kundali"}
                        loading="lazy" className={`h-full w-full object-cover ${ride ? "object-[50%_30%]" : ""}`} />
                    <Tag tone={ride ? "bg-emerald-500 text-white" : undefined}>{ride ? "For sightseeing" : "For life questions"}</Tag>
                </div>
                <div className="flex flex-1 flex-col p-3 md:p-5" style={{ color: INK }}>
                    <p className="inline-flex items-center gap-1.5 text-sm font-semibold leading-tight md:gap-2 md:text-base">
                        {ride ? <Ship size={16} className="shrink-0 text-emerald-600" /> : <Video size={16} className="shrink-0 text-[#c46a12]" />}
                        {ride ? "Boat ride" : "1-on-1 with a guru"}
                    </p>
                    <p className="mt-1.5 font-display text-2xl leading-none md:mt-2 md:text-4xl" style={{ color: GOLD_INK }}>
                        {ride && <span className="mr-1 font-sans text-[11px] font-medium text-[#16122b]/55 md:text-sm">from</span>}
                        {inr(ride ? RIDE_FROM_INR : CONSULT_ONLY_INR)}
                    </p>
                    {ride
                        ? <p className="mt-1 text-[10px] leading-snug text-[#16122b]/55 md:text-[11px]">Price per boat for 2 people. Adding more passengers raises the price.</p>
                        : <p className="mt-1 inline-flex items-center gap-1 text-[10px] text-[#16122b]/60 md:text-xs">
                            {/* eslint-disable-next-line @next/next/no-img-element -- small product icon */}
                            <img src="/consult/google-meet.svg" alt="" width={14} height={14} className="h-3.5 w-3.5" /> {CONSULT_ONLY_MINUTES}-min Google Meet
                        </p>}
                    <ul className="mb-4 mt-3 hidden flex-1 content-start gap-2 text-sm text-[#16122b]/75 md:grid">
                        {ride
                            ? <><Tick tone="text-emerald-600">A private boat for your group</Tick><Tick tone="text-emerald-600">Life jackets for everyone</Tick><Tick tone="text-emerald-600">Trusted local boatman</Tick></>
                            : <><Tick tone="text-[#c46a12]">A Vedic guru or a numerologist</Tick><Tick tone="text-[#c46a12]">Kundli, Lo Shu grid and remedies</Tick><Tick tone="text-[#c46a12]">From anywhere — phone or laptop</Tick></>}
                    </ul>
                    <Link href={ride ? "/book" : "/ride-and-consult?plan=consult"}
                        className={`mt-3 inline-flex h-10 items-center justify-center gap-1.5 rounded-full text-sm font-semibold transition-colors md:mt-auto md:h-12 md:text-base ${ride ? "bg-emerald-600 text-white hover:bg-emerald-700" : "border border-[#16122b]/20 hover:border-[#16122b]/50"}`}>
                        {ride ? "Book a ride" : "Book a session"} <ArrowRight size={15} />
                    </Link>
                </div>
            </div>
        </div>
    );
}

// C: the ride and a session together — a deep night card in the middle, with a gold aura breathing around it.
function ComboCard() {
    return (
        <div className="relative h-full">
            {/* The aura: soft gold light drifting around the card. Pre-blurred gradients moved with transforms only. */}
            <div aria-hidden className="pointer-events-none absolute -inset-10 md:-inset-16">
                <div className="aura-drift-a absolute left-[-8%] top-[-6%] h-[60%] w-[80%] rounded-full bg-[radial-gradient(closest-side,rgba(255,190,70,0.85),rgba(255,160,40,0.3)_55%,transparent)]" />
                <div className="aura-drift-b absolute bottom-[-6%] right-[-8%] h-[60%] w-[80%] rounded-full bg-[radial-gradient(closest-side,rgba(255,160,50,0.8),rgba(232,193,88,0.28)_55%,transparent)]" />
            </div>
            <div aria-hidden className="glow-breathe pointer-events-none absolute inset-0 rounded-[1.75rem] shadow-[0_0_50px_12px_rgba(255,182,39,0.55)] md:shadow-[0_0_80px_18px_rgba(255,182,39,0.5)]" />
            <div className="relative h-full overflow-hidden rounded-[1.75rem] p-[2px] shadow-[0_40px_80px_-30px_rgba(120,70,10,0.65)]">
                {/* The gold edge: a conic gradient turning behind the card (a transform, so it never repaints) */}
                <span aria-hidden className="ring-turn absolute left-1/2 top-1/2 aspect-square w-[180%] bg-[conic-gradient(#7a5a14,#f9e29a_12%,#e8c158_25%,#7a5a14_45%,#ffd36b_62%,#b8862a_80%,#7a5a14)]" />
                <div className="shine-loop relative flex h-full flex-col overflow-hidden rounded-[calc(1.75rem-2px)] bg-[radial-gradient(120%_70%_at_50%_0%,#3a2a10_0%,#1c1433_55%,#120d26_100%)] p-4 text-white md:p-6">
                    <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white/90 md:text-[10px]">For the full Kashi experience</span>
                        <span className="rounded-full bg-[#7ee0c9] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-night md:text-[10px]">Best value</span>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                        <div className="flex shrink-0 -space-x-3">
                            {EXPERTS.map((e, i) => (
                                // eslint-disable-next-line @next/next/no-img-element -- small portraits
                                <img key={e.slug} src={e.icon} alt={e.name} width={56} height={56} loading="lazy"
                                    className="float-soft h-12 w-12 rounded-full border-2 border-[#e8c158] object-cover shadow-[0_0_18px_rgba(232,193,88,0.5)] md:h-14 md:w-14"
                                    style={{ animationDuration: `${4.2 + i * 1.1}s`, animationDelay: `${-i * 1.3}s` }} />
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
        </div>
    );
}

// On a laptop the side cards start tucked behind the combo and glide out as the section scrolls in
// (eased through a spring, so the motion settles rather than stops), then float.
function FanCard({ side, progress, children }: { side: -1 | 1; progress: MotionValue<number>; children: React.ReactNode }) {
    const x = useTransform(progress, [0, 1], [`${-side * 105}%`, "0%"]);
    const y = useTransform(progress, [0, 1], [40, 28]);
    const scale = useTransform(progress, [0, 1], [0.84, 0.96]);
    const opacity = useTransform(progress, [0, 0.3, 1], [0, 0.9, 1]);
    return (
        <motion.div style={{ x, y, scale, opacity }} className="relative h-full will-change-transform">
            <div className="float-y h-full" style={{ animationDuration: side < 0 ? "6.5s" : "7.8s", animationDelay: side < 0 ? "0s" : "-3s" }}>{children}</div>
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
    const { scrollYProgress } = useScroll({ target: stage, offset: ["start 0.95", "start 0.35"] });
    const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 22, mass: 0.6, restDelta: 0.001 });

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
        <section ref={section} id="ride-and-consult" className="relative isolate scroll-mt-16 overflow-hidden pb-56 pt-28 md:pb-72 md:pt-44" style={{ color: INK }}>
            <Backdrop />
            <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
                <p className="text-center text-[11px] font-semibold uppercase tracking-[0.32em]" style={{ color: GOLD_INK }}>Ride + guru combo</p>
                <h2 className="mx-auto mt-3 max-w-3xl text-center font-display text-[2.6rem] font-light leading-[1.02] tracking-[-0.02em] sm:text-6xl">
                    One evening on the Ganga. <em className="text-[#c46a12]">A lifetime of answers.</em>
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-center text-sm text-[#16122b]/65 md:text-base">Sail past the ghats in your own boat, then sit face to face with a Kashi guru on Google Meet — both for barely more than one.</p>

                {fan ? (
                    <div ref={stage} className="mt-16 grid grid-cols-[1fr_1.12fr_1fr] items-stretch gap-6">
                        <FanCard side={-1} progress={progress}><SideCard kind="ride" /></FanCard>
                        <div className="relative z-10"><ComboCard /></div>
                        <FanCard side={1} progress={progress}><SideCard kind="consult" /></FanCard>
                    </div>
                ) : (
                    // Phones: the combo first, then the ride and the session side by side — one short scroll.
                    <div ref={stage} className="mt-10">
                        <ComboCard />
                        <div className="mt-7 grid grid-cols-2 gap-3">
                            <SideCard kind="ride" />
                            <SideCard kind="consult" />
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
