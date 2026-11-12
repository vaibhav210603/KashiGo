"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Check, Ship, Sparkles, Video } from "lucide-react";
import { inr } from "@/lib/boatRides";
import { CONSULT_ONLY_INR, CONSULT_ONLY_MINUTES, COMBO_FROM_INR, COMBO_WORTH_INR, FREE_CALL_MINUTES, LONGER_MEET_INR, RIDE_FROM_INR } from "@/lib/combo";
import { EXPERTS } from "@/lib/experts";
import { Boat } from "@/components/home/DevDeepawali";

const GOLD = "#e8c158";

// Stops every loop inside `ref` while it's scrolled off screen (same as the Dev Deepawali river).
function usePauseOffscreen() {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(([e]) => el.classList.toggle("anim-paused", !e.isIntersecting));
        io.observe(el);
        return () => io.disconnect();
    }, []);
    return ref;
}

const Tick = ({ children, tone = "text-marigold" }: { children: React.ReactNode; tone?: string }) => (
    <li className="flex gap-2"><Check size={16} className={`mt-0.5 shrink-0 ${tone}`} />{children}</li>
);

// Planets (with their glyphs) and the zodiac. The text variation selector keeps phones from drawing the zodiac as emoji.
const PLANETS = [
    { r: 34, size: 9, color: "#ffd36b", dur: 14, glyph: "☉" },
    { r: 52, size: 7, color: "#9ecbff", dur: 22, glyph: "☽" },
    { r: 70, size: 8, color: "#ff8a5c", dur: 30, glyph: "♂" },
    { r: 88, size: 11, color: "#f3d27a", dur: 42, glyph: "♃" },
];
const ZODIAC = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"].map((z) => `${z}︎`);

// The combo card's moving background: the sky above (planets on their orbits, a ring of zodiac signs turning,
// drifting glyphs) melting into the Ganga below (waves, boats). Transforms and opacity only.
function SkyAndRiver() {
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* Night sky → dusk gold in the middle → river blue */}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#0b0a24_0%,#1b1240_30%,#3a2416_52%,#14306e_70%,#0a1a46_100%)]" />
            {[[8, 6], [20, 18], [36, 4], [62, 10], [80, 5], [92, 20], [50, 22], [14, 30], [72, 28]].map(([l, t], i) => (
                <span key={i} className="shimmer absolute h-[3px] w-[3px] rounded-full bg-white" style={{ left: `${l}%`, top: `${t}%`, animationDelay: `${-i * 0.6}s` }} />
            ))}

            {/* The zodiac wheel turning slowly behind the planets */}
            <div className="absolute left-1/2 top-[-4.5rem] h-[19rem] w-[19rem] -translate-x-1/2">
                <div className="spin-slow absolute inset-0" style={{ animationDuration: "60s" }}>
                    <div className="absolute inset-0 rounded-full border border-[#e8c158]/25" />
                    <div className="absolute inset-6 rounded-full border border-dashed border-[#e8c158]/20" />
                    {ZODIAC.map((z, i) => (
                        <span key={i} className="absolute left-1/2 top-1/2 -ml-2 -mt-2.5 w-4 text-center text-base leading-5 text-[#f3d27a]/70"
                            style={{ transform: `rotate(${i * 30}deg) translateY(-8.7rem)` }}>{z}</span>
                    ))}
                </div>
                {/* Planets on their orbits around a glowing centre */}
                <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#fff3c4_0%,#ffb627_45%,transparent_72%)] glow-pulse" />
                {PLANETS.map((p, i) => (
                    <div key={i} className="absolute left-1/2 top-1/2" style={{ width: p.r * 2, height: p.r * 2, marginLeft: -p.r, marginTop: -p.r }}>
                        <div className="absolute inset-0 rounded-full border border-white/10" />
                        <div className="spin-slow absolute inset-0" style={{ animationDuration: `${p.dur}s`, animationDirection: i % 2 ? "reverse" : "normal" }}>
                            <span className="absolute left-1/2 top-0 rounded-full" style={{ width: p.size, height: p.size, marginLeft: -p.size / 2, marginTop: -p.size / 2, background: p.color, boxShadow: `0 0 10px ${p.color}` }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Planet glyphs and Om floating up through the sky */}
            {["ॐ", "♄", "♀", "☿", "✦", "♃"].map((g, i) => (
                <span key={i} className="astro-float absolute font-deva text-lg text-[#f3d27a]/50" style={{ left: `${8 + i * 16}%`, top: `${14 + (i % 3) * 9}%`, animationDelay: `${-i * 1.7}s` }}>{g}</span>
            ))}

            {/* The river: lamp light on the water, two wave bands and the boats */}
            <div className="absolute inset-x-0 bottom-0 h-[38%]">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#123077]/70 to-[#0a1a46]" />
                <div className="shimmer absolute inset-x-0 top-[18%] h-10 bg-[repeating-linear-gradient(90deg,rgba(255,190,90,0.3)_0_2px,transparent_2px_16px)] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
                <svg className="wave-drift-slow absolute left-0 top-[30%] h-16 w-[200%]" viewBox="0 0 2880 200" preserveAspectRatio="none">
                    <path d={wave(12, 60)} fill="#1b4296" opacity="0.6" />
                </svg>
                <div className="drift-across absolute left-0 bottom-[30%] h-12 w-28" style={{ animationDuration: "26s", animationDelay: "-8s" }}>
                    <div className="bob h-full w-full"><Boat /></div>
                </div>
                <div className="bob absolute bottom-[14%] right-[4%] h-12 w-28" style={{ animationDuration: "5s" }}><Boat flip /></div>
                <svg className="wave-drift absolute bottom-0 left-0 h-14 w-[200%] [animation-direction:reverse]" viewBox="0 0 2880 200" preserveAspectRatio="none">
                    <path d={wave(14, 70, 320)} fill="#0a1a46" />
                </svg>
            </div>
        </div>
    );
}

// Two identical periods side by side, so a -50% slide loops without a seam.
function wave(amp: number, y: number, len = 240) {
    let d = `M0 ${y}`;
    for (let x = 0; x < 2880; x += len) d += ` q${len / 4} ${-amp} ${len / 2} 0 t${len / 2} 0`;
    return `${d} V200 H0 Z`;
}

// Three offers side by side (lib/combo.ts): the ride, a session alone, and both together for barely more than the
// session. The session alone is the decoy — it makes the combo the obvious pick. Each card says who it's for and what's in it.
export default function RideConsultOffer() {
    const comboRef = usePauseOffscreen();
    return (
        <section id="ride-and-consult" className="relative scroll-mt-16 overflow-hidden bg-night pt-14 pb-24 text-white md:pt-20 md:pb-28">
            <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-px w-[80%] -translate-x-1/2 bg-gradient-to-r from-transparent via-marigold/40 to-transparent" />
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <p className="text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-marigold">Combo packages</p>
                <h2 className="mt-3 text-center font-display text-4xl font-light leading-[1.05] tracking-[-0.02em] sm:text-5xl">Ride the Ganga. <em className="text-fire">Ask a guru.</em></h2>
                <p className="mx-auto mt-3 max-w-xl text-center text-sm text-white/65">A private boat on the river, a live Google Meet with a Kashi guru — or both together for barely more than one.</p>

                <div className="mt-10 grid items-stretch gap-5 md:grid-cols-3 md:gap-4">
                    {/* A — the boat ride */}
                    <div className="flex flex-col overflow-hidden rounded-[1.75rem] border border-white/12 bg-white/[0.04]">
                        <div className="relative aspect-[16/10]">
                            {/* eslint-disable-next-line @next/next/no-img-element -- static photo */}
                            <img src="/gallery/ghats-from-boat.jpg" alt="The ghats of Varanasi seen from a KashiGo boat" loading="lazy" className="h-full w-full object-cover" />
                            <span className="absolute inset-0 bg-gradient-to-t from-night via-night/10 to-transparent" />
                            <span className="absolute left-3 top-3 rounded-full bg-night/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white/90 backdrop-blur">For sightseeing</span>
                        </div>
                        <div className="flex flex-1 flex-col p-5 pt-3">
                            <p className="inline-flex items-center gap-2 font-semibold"><Ship size={18} className="text-marigold" /> Boat ride</p>
                            <p className="mt-1 text-xs text-white/60">See sunrise, the Ganga Aarti or the ghats from the river.</p>
                            <p className="mt-3 font-display text-4xl" style={{ color: GOLD }}><span className="mr-1 font-sans text-sm font-medium text-white/60">from</span>{inr(RIDE_FROM_INR)}</p>
                            <p className="mt-1 text-[11px] leading-snug text-white/50">Price per boat for 2 people. Adding more passengers raises the price.</p>
                            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">What you get</p>
                            <ul className="mb-6 mt-2 grid flex-1 content-start gap-2 text-sm text-white/75">
                                <Tick>A private boat for your group</Tick>
                                <Tick>Life jackets for everyone</Tick>
                                <Tick>Trusted local boatman</Tick>
                            </ul>
                            <Link href="/book" className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/25 font-semibold transition-colors hover:border-marigold">Book a ride <ArrowRight size={16} /></Link>
                        </div>
                    </div>

                    {/* B — a session on its own */}
                    <div className="flex flex-col overflow-hidden rounded-[1.75rem] border border-white/12 bg-white/[0.04]">
                        <div className="relative aspect-[16/10] bg-[#0d0f22]">
                            {/* eslint-disable-next-line @next/next/no-img-element -- animated GIF: a guru on Google Meet, the Lo Shu grid, a kundali */}
                            <img src="/consult/meet-guru.gif" alt="A guru on Google Meet, a Lo Shu grid and a kundali" width={720} height={480} loading="lazy" className="h-full w-full object-cover" />
                            <span className="absolute left-3 top-3 rounded-full bg-night/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white/90 backdrop-blur">For life questions</span>
                        </div>
                        <div className="flex flex-1 flex-col p-5 pt-3">
                            <p className="inline-flex items-center gap-2 font-semibold"><Video size={18} className="text-marigold" /> 1-on-1 with a Kashi guru</p>
                            <p className="mt-1 text-xs text-white/60">Love, career, money, health — ask about what&apos;s on your mind.</p>
                            <p className="mt-3 font-display text-4xl" style={{ color: GOLD }}>{inr(CONSULT_ONLY_INR)}</p>
                            <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-white/60">
                                {/* eslint-disable-next-line @next/next/no-img-element -- small product icon */}
                                <img src="/consult/google-meet.svg" alt="" width={16} height={16} className="h-4 w-4" /> {CONSULT_ONLY_MINUTES}-minute live Google Meet
                            </p>
                            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">What you get</p>
                            <ul className="mb-6 mt-2 grid flex-1 content-start gap-2 text-sm text-white/75">
                                <Tick>A Vedic guru or a numerologist</Tick>
                                <Tick>Kundli, Lo Shu grid and remedies</Tick>
                                <Tick>From anywhere — phone or laptop</Tick>
                            </ul>
                            <Link href="/ride-and-consult?plan=consult" className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/25 font-semibold transition-colors hover:border-marigold">Book a session <ArrowRight size={16} /></Link>
                        </div>
                    </div>

                    {/* C — both, for a little more than B. A golden aura turns around it; inside, the sky and the river move. */}
                    <div ref={comboRef} className="relative mt-3 md:mt-0">
                        <div aria-hidden className="combo-aura pointer-events-none absolute -inset-2 rounded-[2.4rem] opacity-80 blur-lg" />
                        <div className="combo-ring relative flex h-full flex-col overflow-hidden rounded-[1.75rem] p-[2px] shadow-[0_30px_90px_-25px_rgba(232,193,88,0.8)]">
                            <div className="relative flex flex-1 flex-col overflow-hidden rounded-[calc(1.75rem-2px)]">
                                <SkyAndRiver />
                                <div className="relative flex flex-1 flex-col p-5">
                                    <div className="flex items-center justify-between">
                                        <span className="rounded-full bg-night/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white/90 backdrop-blur">For the full Kashi experience</span>
                                        <span className="rounded-full bg-[#7ee0c9] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-night">Best value</span>
                                    </div>

                                    {/* The gurus, under the turning sky */}
                                    <div className="mt-28 flex justify-center">
                                        <div className="flex -space-x-3">
                                            {EXPERTS.map((e, i) => (
                                                // eslint-disable-next-line @next/next/no-img-element -- small portraits
                                                <img key={e.slug} src={e.icon} alt={e.name} width={64} height={64} loading="lazy"
                                                    className="bob h-16 w-16 rounded-full border-2 border-[#e8c158] object-cover shadow-[0_0_24px_rgba(232,193,88,0.6)]"
                                                    style={{ animationDuration: `${4 + i}s`, animationDelay: `${-i * 1.3}s` }} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="mt-2 text-center text-[11px] text-white/70">Talk to Badri Narayan ji, Maruti Kinkar Maharaj or Vibha</p>

                                    <div className="mt-4 rounded-2xl bg-night/55 p-4 ring-1 ring-[#e8c158]/30 backdrop-blur-sm">
                                        <p className="inline-flex items-center gap-2 font-semibold"><Ship size={18} className="text-marigold" /> + <Video size={18} className="text-marigold" /> Ride + guru combo</p>
                                        <p className="mt-2 font-display text-4xl" style={{ color: GOLD }}><span className="mr-1 font-sans text-sm font-medium text-white/60">starting at</span>{inr(COMBO_FROM_INR)}</p>
                                        <p className="mt-1 text-xs text-white/65">Worth <s>{inr(COMBO_WORTH_INR)}</s> · just {inr(COMBO_FROM_INR - CONSULT_ONLY_INR)} more than a session alone</p>
                                        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">What you get</p>
                                        <ul className="mt-2 grid gap-2 text-sm text-white/90">
                                            <Tick tone="text-[#7ee0c9]">Your private boat ride on the Ganga</Tick>
                                            <Tick tone="text-[#7ee0c9]">A 30-minute Google Meet with a guru (45 min for +{inr(LONGER_MEET_INR)})</Tick>
                                            <Tick tone="text-[#7ee0c9]">A free {FREE_CALL_MINUTES}-minute call first</Tick>
                                        </ul>
                                        <Link href="/ride-and-consult" className="btn-sheen mt-5 flex h-14 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-marigold via-fire to-ember text-lg font-extrabold text-night shadow-[0_14px_40px_-12px_rgba(255,122,26,0.9)]">
                                            <Sparkles size={18} /> Build my combo <ArrowRight size={18} />
                                        </Link>
                                    </div>
                                    {/* Room for the boats on the river below */}
                                    <div className="h-24" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
