"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { AlertTriangle, ArrowDown, Minus, Play, Plus, TrendingUp } from "lucide-react";
import { inr, istNow } from "@/lib/boatRides";
import { money, useCurrency } from "@/lib/currency";
import { DEV_DEEPAWALI_LABEL, GHAT_PRICE_INR, LIGHTING_AT, seatPrices, whatsappLink } from "@/lib/devDeepawali";

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

function InvitationSeal() {
    return (
        <span className="inline-flex items-center rounded-md bg-[#d7191f] px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-white shadow-[0_4px_18px_-4px_rgba(215,25,31,0.9)]">
            Invitation
        </span>
    );
}

function FillingFast() {
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

// A clay diya: a static lamp, a flame that flickers and a soft glow — all HTML, all composited.
function Diya({ size = 28, delay = 0 }: { size?: number; delay?: number }) {
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
    const today = useIstToday();
    const [currency] = useCurrency();
    const [now, next] = today ? seatPrices(today, 2) : [];
    const go = () => document.getElementById("dev-deepawali")?.scrollIntoView({ behavior: "smooth", block: "start" });

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

                    <p className="font-display text-4xl leading-none text-white">
                        <s className="mr-2 align-middle font-sans text-lg font-medium text-white/50 decoration-[#ff6b6b] decoration-2">{inr(GHAT_PRICE_INR)}</s>
                        {now ? inr(now.inr) : " "}
                        <span className="ml-1.5 font-sans text-sm font-medium text-white/70">/ person{now ? usdHint(now.inr, currency) : ""}</span>
                    </p>
                    <p className="mt-1.5 text-[11px] text-white/55">{inr(GHAT_PRICE_INR)} is what local boatmen charge on the ghat</p>
                    {next && (
                        <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-[#d7191f]/25 px-3 py-1 text-xs font-semibold text-[#ffc2c2] ring-1 ring-[#ff4d4d]/40">
                            <TrendingUp size={13} /> {inr(next.inr)} from tomorrow · rises daily
                        </p>
                    )}
                    <div className="mt-3"><FillingFast /></div>

                    <button type="button" onClick={go}
                        className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#f3d27a] bg-gradient-to-b from-[#f9e29a] to-[#d6a332] text-base font-bold text-[#0a1c52] shadow-[0_8px_24px_-8px_rgba(232,193,88,0.95)]">
                        Book now <ArrowDown size={16} />
                    </button>
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

function Boat({ flip = false }: { flip?: boolean }) {
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

function RiverScene() {
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

function FestivalFilm() {
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

function Countdown() {
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

// Right after the hero: the river view on the night, today's seat price and Book now, over an animated river.
export function DevDeepawaliSection() {
    const today = useIstToday();
    const [currency] = useCurrency();
    const [people, setPeople] = useState(2);
    const prices = today ? seatPrices(today, 3) : [];
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
                </div>

                <div ref={card} className="shine-once relative lg:order-3 rounded-2xl border-2 border-[#e8c158] bg-gradient-to-b from-[#12348f] to-[#0a1c52] p-4 sm:p-5 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Today&apos;s price</p>
                    <p className="mt-1 font-display text-4xl leading-none" style={{ color: GOLD }}>
                        <s className="mr-2 align-middle font-sans text-xl font-medium text-white/50 decoration-[#ff6b6b] decoration-2">{inr(GHAT_PRICE_INR)}</s>
                        {price ? inr(price) : " "}<span className="ml-1 whitespace-nowrap font-sans text-sm font-medium text-white/70">per person{price ? usdHint(price, currency) : ""}</span>
                    </p>
                    <p className="mt-1.5 text-xs text-white/60">
                        Local boatmen on the ghat charge {inr(GHAT_PRICE_INR)} per person{price ? <> — you save <b className="text-[#7ee0c9]">{inr(GHAT_PRICE_INR - price)}</b> each</> : null}.
                    </p>

                    {/* The price goes up every day — show the next few days so it's plain. */}
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                        {prices.map((p, i) => (
                            <div key={p.iso} className={`rounded-xl px-1 py-2 ${i === 0 ? "bg-[#e8c158] text-[#0a1c52]" : "bg-white/5 text-white/70 ring-1 ring-white/10"}`}>
                                <span className="block text-[11px] font-semibold uppercase tracking-wider">{i === 0 ? "Today" : i === 1 ? "Tomorrow" : fmtDay(p.iso)}</span>
                                <span className="block font-semibold">{inr(p.inr)}</span>
                            </div>
                        ))}
                    </div>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-white/65">
                        <TrendingUp size={14} className="text-[#ff8a8a]" /> The price goes up every day until Dev Deepawali. Book today to lock it in.
                    </p>

                    <div className="mt-4"><Countdown /></div>

                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#d7191f]/15 px-3 py-2 ring-1 ring-[#ff4d4d]/40">
                        <AlertTriangle size={15} className="shrink-0 text-[#ff6b6b]" />
                        <FillingFast />
                    </div>

                    {/* Who's coming — right above the total, so it's plain the total is per head × people */}
                    <div className="mt-5 rounded-2xl border-2 border-[#e8c158] bg-[#e8c158]/10 p-3">
                        <div className="flex items-center justify-between gap-3">
                            <span className="pl-1 text-base font-semibold text-white">How many people?</span>
                            <span className="flex items-center gap-2">
                                <button type="button" aria-label="Fewer people" onClick={() => setPeople((p) => Math.max(1, p - 1))}
                                    className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#e8c158] text-[#f3d27a] disabled:opacity-40" disabled={people <= 1}><Minus size={18} /></button>
                                <span className="w-9 text-center font-display text-3xl leading-none text-white tabular-nums" aria-live="polite">{people}</span>
                                <button type="button" aria-label="More people" onClick={() => setPeople((p) => Math.min(20, p + 1))}
                                    className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e8c158] text-[#0a1c52]"><Plus size={18} /></button>
                            </span>
                        </div>
                        {price > 0 && (
                            <div className="mt-3 flex items-baseline justify-between border-t border-[#e8c158]/30 pt-3 text-sm">
                                <span className="text-white/75">{inr(price)} × {people} {people === 1 ? "person" : "people"}</span>
                                <span className="font-display text-2xl text-white">{inr(price * people)}</span>
                            </div>
                        )}
                    </div>

                    <a href={whatsappLink(people, price)} target="_blank" rel="noopener"
                        className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-full border border-[#f3d27a] bg-gradient-to-b from-[#f9e29a] to-[#d6a332] text-lg font-bold text-[#0a1c52] shadow-[0_10px_30px_-10px_rgba(232,193,88,0.9)]">
                        Book for {people} {people === 1 ? "person" : "people"}
                    </a>
                    <p className="mt-2 text-center text-xs text-white/55">Opens WhatsApp — we confirm your seats and send a secure payment link.</p>
                </div>
            </div>
        </section>
    );
}
