"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, BadgeCheck, BadgeIndianRupee, Check, Eye, LifeBuoy, Loader2, Lock, Minus, Play, Plus, ShieldCheck, Ticket, TrendingUp, UserCheck } from "lucide-react";
import DiyaRiver from "@/components/motion/DiyaRiver";
import { Countdown, FestivalFilm, FillingFast, InvitationSeal, RiverScene } from "@/components/home/DevDeepawali";
import { inr, istNow } from "@/lib/boatRides";
import { money, useCurrency } from "@/lib/currency";
import { AMENITIES, BEST_PRICE_LINE, DD_MAX_PEOPLE, DEV_DEEPAWALI_LABEL, GHAT_PRICE_INR, ddSplit, seatPrices, type DdPay } from "@/lib/devDeepawali";
import { goToThankYou } from "@/lib/thankYou";
import { track } from "@/lib/analytics";

const GOLD = "#e8c158";
const AMENITY_ICONS = [Ticket, Eye, LifeBuoy, UserCheck, BadgeIndianRupee, ShieldCheck];

// India "today", re-read every minute. Empty on the server, so the static page never bakes in a stale price.
const subscribe = (tick: () => void) => { const t = setInterval(tick, 60_000); return () => clearInterval(t); };
const useIstToday = () => useSyncExternalStore(subscribe, () => istNow().iso, () => "");
const fmtDay = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
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

// Fireworks over the hero: bursts of spark lines that bloom and fade (CSS only, see .burst in globals.css).
const BURSTS = [
    { left: "12%", top: "16%", size: 150, color: "#ffd27a", delay: 0 },
    { left: "72%", top: "10%", size: 190, color: "#ff8fd6", delay: 0.9 },
    { left: "44%", top: "24%", size: 120, color: "#9fd8ff", delay: 1.7 },
    { left: "86%", top: "34%", size: 110, color: "#ffb347", delay: 2.3 },
    { left: "26%", top: "38%", size: 95, color: "#fff2b8", delay: 1.2 },
];
function Fireworks() {
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            {BURSTS.map((b, i) => (
                <span key={i} className="burst absolute" style={{ left: b.left, top: b.top, width: b.size, height: b.size, marginLeft: -b.size / 2, animationDelay: `${b.delay}s`, animationDuration: `${2.6 + (i % 3) * 0.4}s` }}>
                    {Array.from({ length: 14 }, (_, k) => (
                        <i key={k} style={{ transform: `translateX(-50%) rotate(${k * (360 / 14)}deg)`, background: `linear-gradient(to top, transparent, ${b.color})`, boxShadow: `0 0 6px ${b.color}` }} />
                    ))}
                </span>
            ))}
        </div>
    );
}

function Label({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
    return (
        <p className={`flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] ${center ? "justify-center" : ""}`} style={{ color: GOLD }}>
            <span aria-hidden className="h-px w-8 bg-gradient-to-r from-transparent to-current" />{children}<span aria-hidden className="h-px w-8 bg-gradient-to-l from-transparent to-current" />
        </p>
    );
}

export default function DevDeepawaliClient() {
    const today = useIstToday();
    const [currency] = useCurrency();
    const ladder = today ? seatPrices(today, 5) : [];
    const price = ladder[0]?.inr ?? 0;
    const tomorrow = ladder[1]?.inDays === 1 ? ladder[1].inr : undefined;
    const next = ladder[1];

    return (
        <div className="w-full bg-night text-white">
            {/* ── Hero ── */}
            <section className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden pb-14 pt-28 md:pt-32">
                {/* Ghat steps lined with diyas (Pexels, free licence): a tall crop for phones, the full width above that. */}
                <div aria-hidden className="absolute inset-0 -z-30 overflow-hidden">
                    <div className="slow-zoom relative h-full w-full">
                        <picture>
                            <source media="(min-width: 640px)" srcSet="/dev-deepawali/diya-steps-wide.jpg" />
                            <img src="/dev-deepawali/diya-steps-tall.jpg" alt="" fetchPriority="high" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
                        </picture>
                    </div>
                </div>
                <div aria-hidden className="absolute inset-0 -z-20 bg-gradient-to-t from-night via-night/50 to-night/60" />
                <div aria-hidden className="absolute inset-0 -z-20 bg-[radial-gradient(90%_60%_at_50%_100%,rgba(255,122,26,0.25),transparent_70%)]" />
                <Fireworks />
                <DiyaRiver className="-z-10" />

                <div className="relative mx-auto w-full max-w-6xl px-4 text-center sm:px-6">
                    <InvitationSeal />
                    <p className="mt-4 font-deva text-3xl sm:text-4xl" style={{ color: GOLD }}>देव दीपावली</p>
                    <h1 className="mt-1 font-display text-[3.2rem] font-light leading-[0.95] tracking-[-0.03em] sm:text-7xl lg:text-8xl">
                        Dev Deepawali <em className="block text-fire">on the Ganga.</em>
                    </h1>
                    <p className="mx-auto mt-5 max-w-xl text-lg text-white/80">{DEV_DEEPAWALI_LABEL} 2026 · Kartik Purnima. The night the gods come down to Kashi — and you watch it from the river.</p>

                    <div className="mx-auto mt-7 inline-flex flex-col items-center rounded-[1.75rem] border-2 bg-[#0a1c52]/75 px-6 py-4 shadow-[0_24px_70px_-20px_rgba(40,100,255,0.75)] backdrop-blur-sm" style={{ borderColor: GOLD }}>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">Shared boat · per person today</p>
                        <p className="mt-1 font-display text-5xl leading-none">
                            <s className="mr-3 align-middle font-sans text-2xl font-medium text-white/45 decoration-[#ff6b6b] decoration-2">{inr(GHAT_PRICE_INR)}</s>
                            <span style={{ color: GOLD }}>{price ? inr(price) : " "}</span>
                        </p>
                        <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#7ee0c9]"><BadgeCheck size={15} /> {BEST_PRICE_LINE}</p>
                        {price > 0 && <p className="mt-1 text-xs text-white/70">You save <b className="text-[#7ee0c9]">{inr(GHAT_PRICE_INR - price)}</b> on the ghat price{currency === "usd" ? ` · ≈ ${money(price, "usd").replace(/\.\d+$/, "")}` : ""}</p>}
                    </div>

                    <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                        <button onClick={() => { track("dd_cta", { from: "hero" }); goBook(); }} className="btn-sheen inline-flex h-14 w-full items-center justify-center gap-2 rounded-full border border-[#f3d27a] bg-gradient-to-b from-[#f9e29a] to-[#d6a332] px-9 text-lg font-bold text-[#0a1c52] shadow-[0_10px_40px_-8px_rgba(232,193,88,0.9)] sm:w-auto">
                            Book your seats <ArrowDown size={18} />
                        </button>
                        <a href="#film" className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full border border-white/25 px-7 font-medium text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-night sm:w-auto">
                            <Play size={16} className="text-marigold" /> Watch the night
                        </a>
                    </div>
                    <div className="mt-5 flex justify-center"><span className="rounded-full bg-night/70 px-4 py-2"><FillingFast /></span></div>
                    <div className="mx-auto mt-7 max-w-sm"><Countdown /></div>
                </div>
            </section>

            {/* ── The film + the story ── */}
            <section id="film" className="relative scroll-mt-16 overflow-hidden bg-gradient-to-b from-night via-[#0a1846] to-night py-16 md:py-24">
                <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr]">
                    <div>
                        <FestivalFilm />
                        <p className="mt-2 text-center text-xs text-white/50">Fireworks, the laser show and the lit ghats on Dev Deepawali · film by Shrunal Waigankar, on YouTube</p>
                    </div>
                    <div>
                        <Label>Diwali of the gods</Label>
                        <h2 className="mt-4 font-display text-4xl font-light leading-[1.05] tracking-[-0.02em] sm:text-5xl">The night Kashi <em className="text-fire">lights the way.</em></h2>
                    </div>
                </div>
            </section>

            {/* ── Price comparison ── */}
            <section className="relative py-16 md:py-24">
                <div className="mx-auto max-w-5xl px-4 sm:px-6">
                    <Label center>The same night, a fairer price</Label>
                    <h2 className="mt-4 text-center font-display text-4xl font-light leading-[1.05] tracking-[-0.02em] sm:text-5xl">What the ghat charges. <em className="text-fire">What we charge.</em></h2>
                    <div className="mt-10 grid gap-5 md:grid-cols-2 md:items-stretch">
                        <div className="relative rounded-[1.75rem] border border-white/12 bg-white/[0.03] p-6 sm:p-8">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Local boatmen on the ghat</p>
                            <p className="mt-3 font-display text-5xl text-white/55"><s className="decoration-[#ff6b6b] decoration-2">{inr(GHAT_PRICE_INR)}</s></p>
                            <p className="mt-1 text-sm text-white/50">per person, on Dev Deepawali night</p>
                            <ul className="mt-6 space-y-2.5 text-sm text-white/55">
                                <li>· Price asked on the spot, in the crowd</li>
                                <li>· A boatman you&apos;ve never met</li>
                                <li>· Nothing in writing before you board</li>
                            </ul>
                        </div>
                        <div className="relative overflow-hidden rounded-[1.75rem] border-2 bg-gradient-to-b from-[#12348f] to-[#0a1c52] p-6 shadow-[0_30px_80px_-30px_rgba(232,193,88,0.6)] sm:p-8" style={{ borderColor: GOLD }}>
                            <span className="shine-loop pointer-events-none absolute inset-0" aria-hidden />
                            <div className="flex items-start justify-between gap-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: GOLD }}>With KashiGo · today</p>
                                {price > 0 && <span className="rounded-full bg-[#7ee0c9] px-3 py-1 text-xs font-bold text-night">Save {inr(GHAT_PRICE_INR - price)}</span>}
                            </div>
                            <p className="mt-3 font-display text-6xl" style={{ color: GOLD }}>{price ? inr(price) : " "}</p>
                            <p className="mt-1 text-sm text-white/70">per person · {next ? `${inr(next.inr)} from ${next.inDays === 1 ? "tomorrow" : fmtDay(next.iso)}` : "rises every 2 days"}</p>
                            <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#7ee0c9]"><BadgeCheck size={15} /> {BEST_PRICE_LINE}</p>
                            <ul className="mt-4 flex flex-wrap gap-1.5 text-xs text-white/90">
                                {AMENITIES.map((a) => <li key={a.title} className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1"><Check size={12} className="text-[#7ee0c9]" />{a.short}</li>)}
                            </ul>
                            <button onClick={() => { track("dd_cta", { from: "compare" }); goBook(); }} className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#f3d27a] bg-gradient-to-b from-[#f9e29a] to-[#d6a332] font-bold text-[#0a1c52]">
                                Book now <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Included: the guarantee up front, the rest as a swipeable row of badges ── */}
            <section className="relative isolate overflow-hidden py-14 md:py-20">
                <div aria-hidden className="absolute inset-0 -z-20"><Image src="/e_aarti_bg.png" alt="" fill sizes="100vw" className="object-cover" /></div>
                <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-night via-night/45 to-night" />
                <div className="mx-auto max-w-5xl px-4 sm:px-6">
                    <Label center>Included with every seat</Label>
                    <div className="mx-auto mt-6 flex max-w-2xl items-center gap-4 rounded-[1.75rem] border-2 bg-[#0a1c52]/80 p-5 text-left shadow-[0_24px_70px_-25px_rgba(126,224,201,0.45)] backdrop-blur-sm sm:gap-5 sm:p-6" style={{ borderColor: GOLD }}>
                        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7ee0c9] to-[#2bb3a7] text-night shadow-[0_10px_30px_-10px_rgba(126,224,201,0.9)]"><ShieldCheck size={32} /></span>
                        <div>
                            <h2 className="font-display text-3xl leading-tight sm:text-4xl">100% money-back guarantee</h2>
                            <p className="mt-1 text-sm text-white/75">If we can&apos;t give you the ride you booked, you get every rupee back. <Link href="/policies#guarantee" className="text-marigold underline underline-offset-4">The policy</Link></p>
                        </div>
                    </div>
                    <ul className="rail -mx-4 mt-5 px-4 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0" aria-label="Also included">
                        {AMENITIES.filter((a) => !/money-back/i.test(a.title)).map((a, i) => {
                            const Icon = AMENITY_ICONS[i % AMENITY_ICONS.length];
                            return (
                                <li key={a.title} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-marigold/40 bg-night/70 px-3.5 py-2 text-sm text-white/90 backdrop-blur-sm">
                                    <Icon size={15} className="text-marigold" />{a.short}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </section>

            {/* ── Urgency: the price rises every 2 days ── */}
            <section className="py-16 md:py-20">
                <div className="mx-auto max-w-5xl px-4 sm:px-6">
                    <div className="rounded-[2rem] border-2 bg-gradient-to-br from-[#12348f] via-[#0b2366] to-[#0a1c52] p-6 sm:p-9" style={{ borderColor: GOLD }}>
                        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="flex items-center gap-2 font-semibold text-[#ffc2c2]"><TrendingUp size={18} /> The price rises ₹200 every 2 days until the festival</p>
                                <h2 className="mt-2 font-display text-3xl font-light leading-tight sm:text-4xl">Book today, <em style={{ color: GOLD }}>pay today&apos;s price.</em></h2>
                            </div>
                            <div className="rounded-full bg-[#d7191f]/20 px-4 py-2 ring-1 ring-[#ff4d4d]/40"><FillingFast /></div>
                        </div>
                        <ol className="mt-7 grid grid-cols-3 gap-2 sm:grid-cols-5">
                            {ladder.map((p, i) => (
                                <li key={p.iso} className={`rounded-2xl px-2 py-3 text-center ${i === 0 ? "bg-[#e8c158] text-[#0a1c52] shadow-[0_10px_30px_-10px_rgba(232,193,88,0.9)]" : "bg-white/5 text-white/75 ring-1 ring-white/10"} ${i > 2 ? "hidden sm:block" : ""}`}>
                                    <span className="block text-[11px] font-bold uppercase tracking-wider">{i === 0 ? "Today" : p.inDays === 1 ? "Tomorrow" : fmtDay(p.iso)}</span>
                                    <span className="mt-0.5 block font-display text-xl">{inr(p.inr)}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </section>

            {/* ── Booking ── */}
            <BookingForm price={price} tomorrow={tomorrow} />

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
function BookingForm({ price, tomorrow }: { price: number; tomorrow?: number }) {
    const [people, setPeople] = useState(2);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [others, setOthers] = useState<string[]>([""]);
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

    const setCount = (n: number) => {
        const c = Math.max(1, Math.min(DD_MAX_PEOPLE, n));
        setPeople(c);
        setOthers((o) => Array.from({ length: c - 1 }, (_, i) => o[i] ?? ""));
    };
    // Arriving from the home page with a head count (/dev-deepawali?people=4#book). Read after hydration,
    // since the page itself is prerendered without the query.
    useEffect(() => {
        const n = Number(new URLSearchParams(window.location.search).get("people"));
        if (!(n >= 1)) return;
        const t = setTimeout(() => setCount(n), 0);
        return () => clearTimeout(t);
    }, []);
    const total = price * people;
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
                <div className="text-center">
                    <InvitationSeal />
                    <p className="mt-4 text-sm font-semibold uppercase tracking-[0.25em] text-white/60">Book your seats for</p>
                    <h2 className="mt-1 font-display text-5xl font-light leading-none tracking-[-0.02em] sm:text-6xl" style={{ color: GOLD }}>24 November 2026</h2>
                    <p className="mt-2 text-white/75">Tuesday · Dev Deepawali evening · KashiGo shared boat</p>
                </div>

                <form ref={formRef} onSubmit={submit} className="shine-once go relative mt-8 rounded-[2rem] border-2 bg-gradient-to-b from-[#12348f] to-[#0a1c52] p-5 shadow-[0_40px_100px_-30px_rgba(40,100,255,0.7)] sm:p-8" style={{ borderColor: GOLD }}>
                    <p className="mb-5 flex items-center justify-center gap-2 rounded-full bg-[#e8c158] px-4 py-2 text-center text-sm font-bold text-[#0a1c52]">You&apos;re booking for Tuesday, 24 November 2026</p>
                    {/* 1 — who's coming */}
                    <p className="flex items-center gap-2.5 text-sm font-bold uppercase tracking-[0.18em]" style={{ color: GOLD }}><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e8c158] text-xs text-[#0a1c52]">1</span> Passenger details</p>
                    <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border-2 border-[#e8c158] bg-[#e8c158]/10 p-3">
                        <span className="pl-1 font-semibold">How many people?</span>
                        <span className="flex items-center gap-2">
                            <button type="button" aria-label="Fewer people" onClick={() => setCount(people - 1)} disabled={people <= 1} className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#e8c158] text-[#f3d27a] disabled:opacity-40"><Minus size={18} /></button>
                            <span className="w-9 text-center font-display text-3xl tabular-nums" aria-live="polite">{people}</span>
                            <button type="button" aria-label="More people" onClick={() => setCount(people + 1)} disabled={people >= DD_MAX_PEOPLE} className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e8c158] text-[#0a1c52] disabled:opacity-40"><Plus size={18} /></button>
                        </span>
                    </div>
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
                        <div className="flex justify-between text-white/70"><span>{inr(price)} × {people} {people === 1 ? "person" : "people"}</span><span className="tabular-nums">{inr(total)}</span></div>
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
                    <p className="mt-3 text-center text-xs text-white/55">UPI · Cards · Net banking · Wallets — processed by Razorpay. We call you after booking with your boarding ghat and time.</p>
                </form>
            </div>

            {/* Phones: a jump to the form while reading the page above it */}
            <div className={`fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-[#e8c158]/40 bg-[#0a1c52]/95 px-4 pb-[calc(0.625rem+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur transition-transform duration-300 sm:hidden ${inView ? "translate-y-full" : ""}`}>
                <div className="flex-1 leading-tight">
                    <p className="text-[11px] text-white/60">Dev Deepawali · per person <s className="ml-1 text-white/40">{inr(GHAT_PRICE_INR)}</s></p>
                    <p className="font-display text-xl" style={{ color: GOLD }}>{price ? inr(price) : " "}</p>
                </div>
                <button onClick={goBook} className="h-11 rounded-full bg-gradient-to-b from-[#f9e29a] to-[#d6a332] px-6 text-sm font-extrabold text-[#0a1c52]">Book now</button>
            </div>
        </section>
    );
}
