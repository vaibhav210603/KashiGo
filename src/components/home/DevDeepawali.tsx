"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Minus, Play, Plus, ShieldCheck, TrendingUp } from "lucide-react";
import { inr, istNow } from "@/lib/boatRides";
import { money, useCurrency } from "@/lib/currency";
import { BEST_PRICE_LINE, DD_MAX_PEOPLE, EARLY_BIRD_INR, EARLY_BIRD_LEFT, EARLY_BIRD_OPEN, EARLY_BIRD_SEATS, EARLY_BIRD_TAKEN, DD_PACKS, DEV_DEEPAWALI_LABEL, GHAT_PRICE_INR, LIGHTING_AT, THIRD_SEAT_INR, ddTotal, seatPrices, trioPrice } from "@/lib/devDeepawali";

// Dev Deepawali on the home page: the invitation card in the hero and the section right after it.
// Every animation here is a CSS transform / opacity loop (see globals.css), so phones run them on the GPU,
// and the river pauses while it's scrolled out of view.
const GOLD = "#e8c158";

// India "today", re-read every minute. Empty on the server, so the static page never bakes in a stale price.
const subscribe = (tick: () => void) => { const t = setInterval(tick, 60_000); return () => clearInterval(t); };
const useIstToday = () => useSyncExternalStore(subscribe, () => istNow().iso, () => "");

// The seat is priced in rupees; visitors browsing in $ get a rough conversion next to it.
const usdHint = (n: number, currency: string) => (currency === "usd" ? ` ≈ ${money(n, "usd").replace(/\.\d+$/, "")}` : "");
const fmtDay = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });

export function InvitationSeal() {
    return (
        <span className="inline-flex items-center rounded-md bg-[#d7191f] px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-white shadow-[0_4px_18px_-4px_rgba(215,25,31,0.9)]">
            Invitation
        </span>
    );
}

export function FillingFast() {
    return (
        <span className="inline-flex items-center gap-2 text-sm font-bold text-[#ff7070]">
            <span className="relative flex h-2.5 w-2.5">
                <span className="absolute h-full w-full animate-ping rounded-full bg-[#ff4d4d]/70" />
                <span className="relative h-2.5 w-2.5 rounded-full bg-[#ff4d4d]" />
            </span>
            Seats are filling up fast
        </span>
    );
}

// Early-bird seats: how many of the 20 are taken, as a bar that fills in.
export function EarlyBirdMeter({ light = false }: { light?: boolean }) {
    if (!EARLY_BIRD_OPEN) return null;
    const pct = (EARLY_BIRD_TAKEN / EARLY_BIRD_SEATS) * 100;
    return (
        <div>
            <div className="flex items-baseline justify-between text-xs font-semibold">
                <span className={light ? "text-white/80" : "text-white/70"}>{EARLY_BIRD_TAKEN} of {EARLY_BIRD_SEATS} early-bird seats taken</span>
                <span className="text-[#ff7070]">Only {EARLY_BIRD_LEFT} left</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/12">
                <div className="h-full rounded-full bg-gradient-to-r from-[#e8c158] to-[#ff6b6b]" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

// The early-bird offer with a photo of the boat itself: regular price struck through, ₹3,599, seats left.
export function EarlyBirdOffer({ was, onBook }: { was: number; onBook?: () => void }) {
    if (!EARLY_BIRD_OPEN) return null;
    return (
        <div className="overflow-hidden rounded-[1.75rem] border-2 border-[#e8c158] bg-[#0a1c52] shadow-[0_24px_70px_-24px_rgba(232,193,88,0.6)] md:grid md:grid-cols-[1.2fr_1fr]">
            <div className="relative aspect-[4/3] md:aspect-auto">
                {/* eslint-disable-next-line @next/next/no-img-element -- photo of our boat, lit for the night */}
                <img src="/dev-deepawali/our-boat.jpg" alt="The KashiGo shared boat on the Ganga at night, lit with lights and marigold garlands" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                <span className="absolute left-3 top-3 rounded-full bg-[#d7191f] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-white shadow-lg">Early-bird offer</span>
                <span className="absolute bottom-3 left-3 rounded-full bg-night/75 px-3 py-1 text-xs text-white/90">This is your boat on Dev Deepawali</span>
            </div>
            <div className="p-5 sm:p-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">Shared boat · per person</p>
                <p className="mt-2 font-display leading-none">
                    <s className="mr-2 align-middle font-sans text-xl font-medium text-white/50 decoration-[#ff6b6b] decoration-[3px]">{was ? inr(was) : " "}</s>
                    <span className="text-5xl sm:text-6xl" style={{ color: GOLD }}>{inr(EARLY_BIRD_INR)}</span>
                </p>
                <p className="mt-3 text-sm text-white/80">For the <b className="text-white">FINAL {EARLY_BIRD_SEATS} passengers</b> only. When they&apos;re gone, the price goes back up.</p>
                <div className="mt-4"><EarlyBirdMeter light /></div>
                <p className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-[#7ee0c9]"><ShieldCheck size={16} /> Best prices and 100% money-back guarantee!</p>
                {onBook && (
                    <button type="button" onClick={onBook}
                        className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#f3d27a] bg-gradient-to-b from-[#f9e29a] to-[#d6a332] text-base font-bold text-[#0a1c52] shadow-[0_10px_30px_-10px_rgba(232,193,88,0.9)]">
                        Grab an early-bird seat <ArrowRight size={17} />
                    </button>
                )}
            </div>
        </div>
    );
}

// A clay diya: a static lamp, a flame that flickers and a soft glow — all HTML, all composited.
export function Diya({ size = 28, delay = 0 }: { size?: number; delay?: number }) {
    return (
        <span aria-hidden className="relative inline-block shrink-0" style={{ width: size, height: size * 0.75 }}>
            <span className="flicker absolute rounded-full" style={{ left: -size * 0.45, right: -size * 0.45, top: -size * 0.75, height: size * 1.6, background: "radial-gradient(circle, rgba(255,176,64,0.55) 0%, rgba(255,120,30,0) 65%)", animationDelay: `${delay}s` }} />
            <span className="flame absolute" style={{ left: "50%", width: size * 0.18, height: size * 0.42, marginLeft: -size * 0.09, bottom: size * 0.38, animationDelay: `${delay * 0.7}s` }} />
            <svg viewBox="0 0 40 16" className="absolute bottom-0 left-0 w-full">
                <path d="M1 4 Q20 22 39 4 Z" fill="#9c3f17" />
                <ellipse cx="20" cy="4" rx="19" ry="3.2" fill="#d9622a" />
            </svg>
        </span>
    );
}

// Gold flourish for the card's corners.
function Corner({ className }: { className: string }) {
    return (
        <svg aria-hidden viewBox="0 0 40 40" className={`absolute h-9 w-9 text-[#e8c158] ${className}`} fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M3 37 V12 Q3 3 12 3 H37" />
            <path d="M8 37 V15 Q8 8 15 8 H37" opacity="0.5" />
            <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
        </svg>
    );
}

const Rod = () => <div aria-hidden className="relative z-10 -mx-1.5 h-2.5 rounded-full bg-gradient-to-r from-[#7a5a14] via-[#f3d27a] to-[#7a5a14] shadow-[0_2px_8px_rgba(0,0,0,0.55)]" />;

// The invitation in the hero: a blue scroll with gold rods that unrolls once on load.
export function InviteCard() {
    return (
        <div className="unroll relative mx-auto w-full max-w-[26rem]">
            <Rod />
            <div className="relative overflow-hidden border-x-2 border-[#e8c158] bg-[radial-gradient(130%_75%_at_50%_0%,#2357d6_0%,#12348f_42%,#0a1c52_100%)] px-5 pt-6 text-center text-white shadow-[0_24px_70px_-20px_rgba(40,100,255,0.75)]">
                <div aria-hidden className="pointer-events-none absolute inset-2 rounded-sm border border-[#e8c158]/40" />
                <Corner className="left-2 top-2" />
                <Corner className="right-2 top-2 -scale-x-100" />
                {/* Purnima moon and a few stars */}
                <span aria-hidden className="glow-pulse absolute right-6 top-6 h-16 w-16 rounded-full bg-[radial-gradient(circle,rgba(255,240,205,0.55),transparent_70%)]" />
                <span aria-hidden className="absolute right-[2.15rem] top-[2.15rem] h-7 w-7 rounded-full bg-[#fff3d4] shadow-[0_0_18px_4px_rgba(255,236,190,0.6)]" />
                {[[14, 30], [22, 62], [70, 22], [84, 54], [40, 14]].map(([l, t], i) => (
                    <span key={i} aria-hidden className="absolute h-1 w-1 rounded-full bg-white/70" style={{ left: `${l}%`, top: t }} />
                ))}

                <div className="relative">
                    <InvitationSeal />
                    <p className="mt-3 font-deva text-base text-[#e8c158]/85">देव दीपावली</p>
                    <p className="font-display text-[2.6rem] leading-[1.05] tracking-tight" style={{ color: GOLD }}>Dev Deepawali</p>
                    <p className="mt-1 text-sm text-white/80">{DEV_DEEPAWALI_LABEL} · Shared boat ride</p>

                    <div aria-hidden className="mx-auto my-4 flex w-40 items-center gap-2 text-[#e8c158]">
                        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-current" />
                        <span className="h-1.5 w-1.5 rotate-45 bg-current" />
                        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-current" />
                    </div>

                    {/* No prices here — the offers (Solo, Pair, Trio) are on the Dev Deepawali page. */}
                    <p className="text-[15px] leading-relaxed text-white/85">Watch a million diyas light up the ghats from the river, with fireworks and the laser show.</p>
                    <p className="mt-2 text-sm font-semibold text-[#f3d27a]">Seat packs for 1, 2 or 3 — the Trio saves the most.</p>
                    <div className="mt-3"><FillingFast /></div>

                    <Link href="/dev-deepawali"
                        className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#f3d27a] bg-gradient-to-b from-[#f9e29a] to-[#d6a332] text-base font-bold text-[#0a1c52] shadow-[0_8px_24px_-8px_rgba(232,193,88,0.95)]">
                        View Dev Deepawali offers <ArrowRight size={16} />
                    </Link>
                </div>

                {/* A line of diyas along the foot of the scroll */}
                <div className="relative -mx-5 mt-5 flex items-end justify-around border-t border-[#e8c158]/25 bg-[#081640]/60 px-3 pb-2 pt-5">
                    {Array.from({ length: 7 }, (_, i) => <Diya key={i} size={22} delay={(i * 0.37) % 1.7} />)}
                </div>
            </div>
            <Rod />
        </div>
    );
}

// ---- The river under the section: far ghats lined with lamps, flowing water, boats and floating diyas ----

// Deterministic ghat skyline (buildings and temple spires) so server and client draw the same thing.
function skyline(width = 1440, base = 64) {
    let seed = 11;
    const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    let d = `M0 ${base}`;
    for (let x = 0; x < width;) {
        const w = 26 + rnd() * 54, top = base - 14 - rnd() * 30;
        d += ` L${x.toFixed(0)} ${top.toFixed(0)}`;
        if (rnd() > 0.62) {
            const peak = top - 16 - rnd() * 18;
            d += ` L${(x + w * 0.3).toFixed(0)} ${top.toFixed(0)} L${(x + w / 2).toFixed(0)} ${peak.toFixed(0)} L${(x + w * 0.7).toFixed(0)} ${top.toFixed(0)}`;
        }
        d += ` L${(x + w).toFixed(0)} ${top.toFixed(0)}`;
        x += w;
    }
    return `${d} L${width} ${base} Z`;
}
const SKYLINE = skyline();

// Two identical periods side by side, so a -50% slide loops without a seam (same trick as RiverWave).
const wave = (amp: number, y: number, len = 240) => {
    let d = `M0 ${y}`;
    for (let x = 0; x < 2880; x += len) d += ` q${len / 4} ${-amp} ${len / 2} 0 t${len / 2} 0`;
    return `${d} V200 H0 Z`;
};

export function Boat({ flip = false }: { flip?: boolean }) {
    const id = useId();
    return (
        <svg viewBox="0 0 170 70" className={`h-full w-full ${flip ? "-scale-x-100" : ""}`} aria-hidden>
            <defs>
                <radialGradient id={`${id}g`}><stop offset="0%" stopColor="#ffb547" stopOpacity="0.8" /><stop offset="100%" stopColor="#ff8a1f" stopOpacity="0" /></radialGradient>
            </defs>
            <circle cx="140" cy="36" r="26" fill={`url(#${id}g)`} />
            {/* passengers */}
            <circle cx="70" cy="26" r="6" fill="#060a18" /><path d="M61 46 Q62 32 70 32 Q78 32 79 46 Z" fill="#060a18" />
            <circle cx="92" cy="28" r="5.5" fill="#060a18" /><path d="M84 46 Q85 34 92 34 Q99 34 100 46 Z" fill="#060a18" />
            {/* boatman with oar */}
            <circle cx="36" cy="18" r="5.5" fill="#060a18" /><path d="M29 46 L31 24 Q36 22 41 24 L43 46 Z" fill="#060a18" />
            <path d="M40 26 L22 66" stroke="#060a18" strokeWidth="3" strokeLinecap="round" />
            {/* hull with a gold rim */}
            <path d="M4 42 Q85 70 166 40 L158 52 Q85 76 14 54 Z" fill="#2a1408" />
            <path d="M4 42 Q85 70 166 40" fill="none" stroke="#e8c158" strokeWidth="2" />
            {/* bow lamp */}
            <path d="M136 38 Q140 24 144 38 Z" fill="#ffe2a0" />
            <ellipse cx="140" cy="39" rx="6" ry="2" fill="#d9622a" />
        </svg>
    );
}

const FLOATERS = [
    { y: 58, size: 18, dur: 38, delay: -4 }, { y: 70, size: 24, dur: 30, delay: -19 }, { y: 62, size: 16, dur: 44, delay: -30 },
    { y: 78, size: 26, dur: 27, delay: -8 }, { y: 66, size: 20, dur: 35, delay: -25 }, { y: 82, size: 28, dur: 25, delay: -15 },
    { y: 56, size: 15, dur: 48, delay: -40 }, { y: 74, size: 22, dur: 32, delay: -2 },
];

export function RiverScene() {
    const ref = useRef<HTMLDivElement>(null);
    // Stop every loop while the river is off screen.
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(([e]) => el.classList.toggle("anim-paused", !e.isIntersecting));
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <div ref={ref} aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-64 overflow-hidden sm:h-80">
            {/* Far bank: ghats with rows of lamps */}
            <svg viewBox="0 0 1440 70" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 top-0 h-[4.5rem] w-full">
                <path d={SKYLINE} fill="#1a2d66" />
                <g className="shimmer" stroke="#ffcf6b" strokeLinecap="round" strokeDasharray="0.1 9">
                    <line x1="0" x2="1440" y1="60" y2="60" strokeWidth="2.6" />
                    <line x1="4" x2="1440" y1="52" y2="52" strokeWidth="2" />
                </g>
                <line x1="2" x2="1440" y1="44" y2="44" stroke="#ffcf6b" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="0.1 13" opacity="0.6" />
            </svg>

            {/* The water */}
            <div className="absolute inset-x-0 bottom-0 top-[4.4rem] bg-gradient-to-b from-[#173a8a] via-[#0d245f] to-night" />
            {/* Lamp light reflected in the river */}
            <div className="shimmer absolute inset-x-0 top-[4.4rem] h-16 bg-[repeating-linear-gradient(90deg,rgba(255,190,90,0.35)_0_2px,transparent_2px_18px)] [mask-image:linear-gradient(to_bottom,black,transparent)]" />

            <svg className="wave-drift-slow absolute left-0 top-[5.2rem] h-28 w-[200%]" viewBox="0 0 2880 200" preserveAspectRatio="none">
                <path d={wave(10, 40)} fill="#1b4296" opacity="0.55" />
            </svg>

            {/* Boats: one drifting across, one moored and bobbing */}
            <div className="drift-across absolute left-0 top-[4.6rem] h-14 w-36 sm:h-16 sm:w-40" style={{ animationDuration: "70s", animationDelay: "-22s", ["--x" as string]: "18vw" }}>
                <div className="bob h-full w-full"><Boat /></div>
            </div>
            <div className="bob absolute right-[6%] top-[6.6rem] h-16 w-40 sm:h-20 sm:w-48" style={{ animationDuration: "6s" }}>
                <Boat flip />
            </div>

            <svg className="wave-drift absolute left-0 top-[8.5rem] h-28 w-[200%] [animation-direction:reverse]" viewBox="0 0 2880 200" preserveAspectRatio="none">
                <path d={wave(12, 40, 320)} fill="#123077" opacity="0.8" />
            </svg>

            {/* Diyas floating downstream */}
            {FLOATERS.map((f, i) => (
                <div key={i} className="drift-across absolute left-0" style={{ top: `${f.y}%`, animationDuration: `${f.dur}s`, animationDelay: `${f.delay}s`, ["--x" as string]: `${(i * 13 + 5) % 95}vw` }}>
                    <div className="bob" style={{ animationDuration: `${3 + (i % 3)}s`, animationDelay: `${-i}s` }}>
                        <Diya size={f.size} delay={(i * 0.41) % 1.7} />
                    </div>
                </div>
            ))}

            <svg className="wave-drift-slow absolute bottom-0 left-0 h-16 w-[200%]" viewBox="0 0 2880 200" preserveAspectRatio="none">
                <path d={wave(14, 70, 360)} fill="#070b18" />
            </svg>
        </div>
    );
}

// Real Dev Deepawali footage (fireworks, the lit ghats, the laser show), embedded from its owner's YouTube channel.
// Until it's tapped this is just the thumbnail — YouTube's player (several hundred KB) only loads on tap.
const FILM = { id: "z4SA0ciEoO8", title: "Dev Deepawali Varanasi — cinematic film", credit: "Shrunal Waigankar" };

export function FestivalFilm() {
    const [playing, setPlaying] = useState(false);
    return (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border-2 border-[#e8c158] bg-night shadow-[0_24px_60px_-24px_rgba(30,80,220,0.8)]">
            {playing ? (
                <iframe className="absolute inset-0 h-full w-full" title={FILM.title}
                    src={`https://www.youtube-nocookie.com/embed/${FILM.id}?autoplay=1&playsinline=1&rel=0&modestbranding=1`}
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
            ) : (
                <button type="button" onClick={() => setPlaying(true)} aria-label={`Play: ${FILM.title}`} className="group absolute inset-0">
                    {/* eslint-disable-next-line @next/next/no-img-element -- YouTube's own thumbnail, hotlinked as embeds do */}
                    <img src={`https://i.ytimg.com/vi/${FILM.id}/maxresdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover" />
                    <span className="absolute inset-0 bg-gradient-to-t from-night/60 via-transparent to-transparent" />
                    <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#f3d27a] bg-[#0a1c52]/80 text-[#f3d27a] shadow-[0_0_30px_rgba(232,193,88,0.6)] transition-transform group-active:scale-95">
                        <Play size={26} fill="currentColor" className="ml-1" />
                    </span>
                </button>
            )}
        </div>
    );
}

export function Countdown() {
    const [left, setLeft] = useState<number | null>(null);
    useEffect(() => {
        const tick = () => setLeft(LIGHTING_AT - Date.now());
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);
    if (left === null || left <= 0) return null;
    const s = Math.floor(left / 1000);
    const parts: [string, number][] = [["days", Math.floor(s / 86400)], ["hrs", Math.floor(s / 3600) % 24], ["min", Math.floor(s / 60) % 60], ["sec", s % 60]];
    return (
        <div className="grid grid-cols-4 gap-2">
            {parts.map(([label, n]) => (
                <div key={label} className="rounded-xl border border-[#e8c158]/40 bg-[#0a1c52]/70 py-2 text-center">
                    <span className="block font-display text-2xl leading-none text-white tabular-nums">{String(n).padStart(2, "0")}</span>
                    <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: GOLD }}>{label}</span>
                </div>
            ))}
        </div>
    );
}

// Solo / Pair / Trio. The Pair is exactly two seats, so next to it the Trio (a 3rd seat for ₹2,001) is the obvious pick.
// Under it, a stepper for any other head count (every 3 seats at the Trio price).
// `compact` (the home page) drops the explanations and keeps the cards and the stepper.
export function SeatPacks({ seat, people, onPick, max = DD_MAX_PEOPLE, compact = false }: { seat: number; people: number; onPick: (n: number) => void; max?: number; compact?: boolean }) {
    return (
        <div>
            <div className="grid grid-cols-3 gap-2">
                {DD_PACKS.map((p) => {
                    const on = people === p.people;
                    const best = p.people === 3;
                    const total = ddTotal(seat, p.people);
                    return (
                        <button key={p.people} type="button" onClick={() => onPick(p.people)} aria-pressed={on}
                            className={`relative flex flex-col items-center rounded-2xl border-2 px-1 pb-2.5 pt-7 text-center transition-colors ${best ? "shine-loop" : ""} ${on ? "border-[#e8c158] bg-[#e8c158]/20" : best ? "border-[#e8c158]/70 bg-[#e8c158]/[0.08]" : "border-white/15 bg-white/[0.04] hover:border-white/35"}`}>
                            {best && <span className="absolute top-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#7ee0c9] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-[#0a1c52]">Best value</span>}
                            <span className="text-sm font-bold text-white">{p.name}</span>
                            <span className="text-[11px] text-white/60">{p.line}</span>
                            <span className="mt-1.5 font-display text-[1.3rem] leading-none tabular-nums" style={{ color: GOLD }}>{seat ? inr(total) : " "}</span>
                            <span className={`mt-1 text-[10px] font-semibold leading-tight ${best ? "text-[#7ee0c9]" : "text-white/50"}`}>
                                {!seat ? " " : best ? `${inr(Math.round(total / 3))} / person` : p.people === 2 ? `${inr(seat)} × 2` : "per person"}
                            </span>
                            {best && seat > 0 && <s className="mt-0.5 text-[10px] text-white/40">{inr(seat * 3)}</s>}
                            <span className={`mt-2 h-4 w-4 rounded-full border-2 ${on ? "border-[#e8c158] bg-[#e8c158] shadow-[inset_0_0_0_3px_#0a1c52]" : "border-white/30"}`} />
                        </button>
                    );
                })}
            </div>
            <p className="mt-2 text-[11px] leading-snug text-white/55">{compact ? "Solo is per person. More passengers raise the total." : "Solo is the price per person, for one seat on the boat. Adding more passengers raises the total."}</p>
            {seat > 0 && !compact && (
                <p className="mt-2 rounded-xl bg-[#7ee0c9]/10 px-3 py-2 text-xs font-semibold text-[#7ee0c9] ring-1 ring-[#7ee0c9]/30">
                    Trio: the 3rd seat costs just {inr(THIRD_SEAT_INR)} — you save {inr(seat * 3 - trioPrice(seat))} on three seats.
                </p>
            )}
            <div className={`flex items-center justify-between gap-3 rounded-2xl bg-white/[0.05] px-3 ring-1 ring-white/10 ${compact ? "mt-2 py-1.5" : "mt-3 py-2"}`}>
                <span className="text-sm text-white/75">{people > 3 ? "Group of" : "Bigger group?"}</span>
                <span className="flex items-center gap-2">
                    <button type="button" aria-label="Fewer people" onClick={() => onPick(Math.max(1, people - 1))} disabled={people <= 1}
                        className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#e8c158] text-[#f3d27a] disabled:opacity-40"><Minus size={16} /></button>
                    <span className="w-7 text-center font-display text-2xl leading-none text-white tabular-nums" aria-live="polite">{people}</span>
                    <button type="button" aria-label="More people" onClick={() => onPick(Math.min(max, people + 1))} disabled={people >= max}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8c158] text-[#0a1c52] disabled:opacity-40"><Plus size={16} /></button>
                </span>
            </div>
            {people > 3 && <p className="mt-1.5 text-[11px] text-white/55">Every 3 seats are charged at the Trio price.</p>}
        </div>
    );
}

// Right after the hero: the river view on the night, today's seat price and Book now, over an animated river.
export function DevDeepawaliSection() {
    const today = useIstToday();
    const [currency] = useCurrency();
    const [people, setPeople] = useState(3);
    const prices = today ? seatPrices(today, 2) : [];
    const price = prices[0]?.inr ?? 0;
    // The price card sweeps with a gold sheen once, the first time it scrolls into view.
    const card = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = card.current;
        if (!el) return;
        const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("go"); io.disconnect(); } }, { threshold: 0.4 });
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <section id="dev-deepawali" className="relative scroll-mt-16 overflow-hidden bg-gradient-to-b from-night via-[#0a1846] to-[#0c1f58] pt-12 pb-60 sm:pb-72 md:pt-20">
            <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-px w-[80%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#e8c158]/60 to-transparent" />
            <RiverScene />

            <div className="relative mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-10">
                <div className="text-center lg:order-2 lg:text-left">
                    <InvitationSeal />
                    <h2 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight text-white sm:text-5xl">Dev Deepawali boat ride</h2>
                    <p className="mt-2 text-base text-white/75">{DEV_DEEPAWALI_LABEL} · evening · shared boat</p>
                </div>

                <div className="lg:order-1 lg:row-span-2">
                    <FestivalFilm />
                    <p className="mt-2 text-center text-xs text-white/55 lg:text-left">Fireworks, the laser show and the lit ghats on Dev Deepawali · film by {FILM.credit}, on YouTube</p>
                    {/* Time left until the lamps are lit, right under the film */}
                    <div className="mt-4"><Countdown /></div>
                </div>

                {/* The booking card, kept short: today's price, who's coming, the total and Book. */}
                <div ref={card} className="shine-once relative mx-auto w-full max-w-md lg:order-3 rounded-2xl border-2 border-[#e8c158] bg-gradient-to-b from-[#12348f] to-[#0a1c52] p-4 text-white">
                    <div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">{prices[0]?.was ? <span className="text-[#ff9b9b]">Early-bird price · first {EARLY_BIRD_SEATS} only</span> : "Today's price"}</p>
                            <p className="mt-1 font-display text-3xl leading-none" style={{ color: GOLD }}>
                                <s className="mr-1.5 align-middle font-sans text-base font-medium text-white/50 decoration-[#ff6b6b] decoration-2">{inr(prices[0]?.was ?? GHAT_PRICE_INR)}</s>
                                {price ? inr(price) : " "}<span className="ml-1 whitespace-nowrap font-sans text-xs font-medium text-white/70">/ person{price ? usdHint(price, currency) : ""}</span>
                            </p>
                        </div>
                        {prices[1] && (
                            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#d7191f]/20 px-2.5 py-1 text-[11px] font-semibold text-[#ffc2c2] ring-1 ring-[#ff4d4d]/40">
                                <TrendingUp size={12} /> {inr(prices[1].inr)} {prices[1].inDays === 1 ? "tomorrow" : `from ${fmtDay(prices[1].iso)}`}
                            </span>
                        )}
                    </div>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#7ee0c9]"><BadgeCheck size={14} /> {BEST_PRICE_LINE}</p>
                    <div className="mt-1"><FillingFast /></div>
                    {EARLY_BIRD_OPEN && (
                        <div className="mt-3 flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element -- photo of our boat */}
                            <img src="/dev-deepawali/our-boat.jpg" alt="The KashiGo boat, lit for Dev Deepawali" loading="lazy" className="h-14 w-20 shrink-0 rounded-lg object-cover ring-1 ring-[#e8c158]/50" />
                            <div className="min-w-0 flex-1"><EarlyBirdMeter /></div>
                        </div>
                    )}

                    <div className="mt-4">
                        <SeatPacks seat={price} people={people} onPick={setPeople} compact />
                    </div>

                    {price > 0 && (
                        <div className="mt-3 flex items-baseline justify-between border-t border-[#e8c158]/30 pt-3 text-sm">
                            <span className="text-white/75">Total for {people} {people === 1 ? "person" : "people"}</span>
                            <span className="font-display text-2xl text-white">{inr(ddTotal(price, people))}</span>
                        </div>
                    )}

                    <Link href={`/dev-deepawali?people=${people}#book`}
                        className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#f3d27a] bg-gradient-to-b from-[#f9e29a] to-[#d6a332] text-base font-bold text-[#0a1c52] shadow-[0_10px_30px_-10px_rgba(232,193,88,0.9)]">
                        Book for {people} {people === 1 ? "person" : "people"} <ArrowRight size={17} />
                    </Link>
                    <p className="mt-2 text-center text-[11px] text-white/55">Pay in full, or 50% now and 50% at the ghat.</p>
                </div>
            </div>
        </section>
    );
}
