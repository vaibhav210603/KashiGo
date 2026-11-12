"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronDown, Clock, Loader2, Lock, Minus, PhoneCall, Plus, ShieldCheck, Ship, Sparkles } from "lucide-react";
import { BOOKING_WINDOW_DAYS, DEV_DEEPAWALI_DAY, DEV_DEEPAWALI_PATH, GHATS, RIDES_BY_POPULARITY, addDaysIso, bookingTimeProblem, inr, istNow, noticeFor, rideStartMinutes, toMinutes, type BoatRideId } from "@/lib/boatRides";
import { FREE_PASSENGERS, EXTRA_PASSENGER_INR } from "@/lib/boatPrices";
import {
    CONCERNS, CONSULT_ONLY_INR, CONSULT_ONLY_MINUTES, COMBO_FROM_INR, COMBO_WORTH_INR, FREE_CALL_MINUTES, MEET_DAYS, MEET_LEAD_MINUTES, MEET_LENGTHS, MEET_SLOTS,
    comboPrice, slotLabel, type ComboPlan,
} from "@/lib/combo";
import { EXPERTS } from "@/lib/experts";
import { goToThankYou } from "@/lib/thankYou";
import { track } from "@/lib/analytics";

const GOLD = "#e8c158";
const MAX_GUESTS = 12;

// India date and minute, re-read every 30 s. Empty on the server so the prerendered page never bakes in a stale day.
const subscribeClock = (tick: () => void) => { const t = setInterval(tick, 30_000); return () => clearInterval(t); };
const readClock = () => { const n = istNow(); return `${n.iso}|${n.minutes}`; };
const serverClock = () => "";
const dayParts = (iso: string, i: number) => {
    const d = new Date(`${iso}T00:00:00Z`);
    return { iso, top: i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-IN", { weekday: "short", timeZone: "UTC" }), bottom: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" }) };
};
const fmtDay = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

const loadRazorpay = () =>
    new Promise<void>((resolve, reject) => {
        if ((window as any).Razorpay) return resolve();
        const s = document.createElement("script");
        s.src = "https://checkout.razorpay.com/v1/checkout.js";
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Could not load Razorpay. Check your connection and try again."));
        document.body.appendChild(s);
    });
const post = (body: object) => fetch("/api/combo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json());

// Each step scrolls into view once the one before it is done — the visitor only ever taps.
const goTo = (id: string) => setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);

function Step({ id, n, title, done, children }: { id: string; n: number; title: string; done?: boolean; children: React.ReactNode }) {
    return (
        <section id={id} className="scroll-mt-24 border-t border-white/10 pt-7 first:border-0 first:pt-0">
            <p className="flex items-center gap-2.5 text-sm font-bold uppercase tracking-[0.16em]" style={{ color: GOLD }}>
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${done ? "bg-[#7ee0c9] text-night" : "bg-[#e8c158] text-night"}`}>{done ? <Check size={15} strokeWidth={3} /> : n}</span>
                {title}
            </p>
            <div className="mt-4">{children}</div>
        </section>
    );
}

function Chip({ on, onClick, children, className = "" }: { on: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
    return (
        <button type="button" onClick={onClick} aria-pressed={on}
            className={`rounded-2xl border-2 text-center transition-colors ${on ? "border-[#e8c158] bg-[#e8c158]/15 text-white" : "border-white/10 bg-white/[0.03] text-white/80 hover:border-white/30"} ${className}`}>
            {children}
        </button>
    );
}

export function MeetBadge({ className = "" }: { className?: string }) {
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#3c4043] ${className}`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- small product icon */}
            <img src="/consult/google-meet.svg" alt="" width={16} height={16} className="h-4 w-4" /> Google Meet
        </span>
    );
}

export default function RideConsultClient() {
    const clock = useSyncExternalStore(subscribeClock, readClock, serverClock);
    const [todayIso, nowMinutes] = clock ? [clock.split("|")[0], Number(clock.split("|")[1])] : ["", 0];
    const now = { iso: todayIso, minutes: nowMinutes };

    const [plan, setPlan] = useState<ComboPlan>("combo");
    const [rideDate, setRideDate] = useState("");
    const [rideId, setRideId] = useState<BoatRideId | "">("");
    const [expert, setExpert] = useState("");
    const [minutes, setMinutes] = useState(30);
    const [concerns, setConcerns] = useState<string[]>([]);
    const [meetDate, setMeetDate] = useState("");
    const [meetTime, setMeetTime] = useState("");
    const [guests, setGuests] = useState(2);
    const [ghat, setGhat] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [dob, setDob] = useState("");
    const [birthTime, setBirthTime] = useState("");
    const [birthPlace, setBirthPlace] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const payRef = useRef<HTMLDivElement>(null);

    // /ride-and-consult?plan=consult opens on the session alone; ?expert=<slug> picks the guru. Read after hydration.
    useEffect(() => {
        const q = new URLSearchParams(window.location.search);
        const t = setTimeout(() => {
            if (q.get("plan") === "consult") setPlan("consult");
            const e = q.get("expert");
            if (e && EXPERTS.some((x) => x.slug === e)) setExpert(e);
        }, 0);
        return () => clearTimeout(t);
    }, []);

    const combo = plan === "combo";
    const rideDays = todayIso ? Array.from({ length: BOOKING_WINDOW_DAYS }, (_, i) => dayParts(addDaysIso(todayIso, i), i)) : [];
    const meetDays = todayIso ? Array.from({ length: MEET_DAYS }, (_, i) => dayParts(addDaysIso(todayIso, i), i)) : [];
    const noticePct = rideDate && todayIso ? noticeFor(rideDate, rideId ? rideStartMinutes(rideId) : 0, now).pct : 0;
    const quote = comboPrice({ plan, rideId, guests, noticePct, minutes: combo ? minutes : CONSULT_ONLY_MINUTES });
    const ridePriceOn = (id: BoatRideId) => comboPrice({ plan: "combo", rideId: id, guests: 2, noticePct: rideDate && todayIso ? noticeFor(rideDate, rideStartMinutes(id), now).pct : 0, minutes: 30 }).totalInr;
    const slotOpen = (t: string) => meetDate !== todayIso || toMinutes(t) >= nowMinutes + MEET_LEAD_MINUTES;
    const chosenExpert = EXPERTS.find((e) => e.slug === expert);
    const s = combo ? 1 : 0; // step numbers shift when there's no ride

    const pickRide = (id: BoatRideId) => { setRideId(id); goTo("step-guru"); };
    const pickExpert = (slug: string) => { setExpert(slug); goTo(combo ? "step-length" : "step-topics"); };
    const pickLength = (m: number) => { setMinutes(m); goTo("step-topics"); };
    const pickSlot = (t: string) => { setMeetTime(t); goTo("step-details"); };
    const toggleConcern = (c: string) => setConcerns((xs) => (xs.includes(c) ? xs.filter((x) => x !== c) : [...xs, c]));

    const problem = (): { msg: string; at: string } | null => {
        if (combo && !rideDate) return { msg: "Choose the date of your boat ride.", at: "step-ride" };
        if (combo && !rideId) return { msg: "Choose your boat ride.", at: "step-ride" };
        if (combo && todayIso) { const p = bookingTimeProblem(rideDate, rideStartMinutes(rideId as BoatRideId), now); if (p) return { msg: p, at: "step-ride" }; }
        if (!expert) return { msg: "Choose the guru you'd like to talk to.", at: "step-guru" };
        if (!concerns.length) return { msg: "Pick at least one thing you'd like to ask about.", at: "step-topics" };
        if (!meetDate || !meetTime || !slotOpen(meetTime)) return { msg: "Choose a date and time for your Google Meet.", at: "step-slot" };
        if (name.trim().length < 2) return { msg: "Add your full name.", at: "step-details" };
        if (phone.replace(/\D/g, "").length < 8) return { msg: "Add a phone number we can call.", at: "step-details" };
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return { msg: "Add your email — your Meet link goes there.", at: "step-details" };
        if (combo && !ghat) return { msg: "Choose the ghat your boat starts from.", at: "step-details" };
        return null;
    };

    const pay = async () => {
        setError("");
        const p = problem();
        if (p) { setError(p.msg); goTo(p.at); return; }
        setBusy(true);
        try {
            track("begin_checkout", { currency: "INR", value: quote.totalInr, item_id: combo ? `combo-${rideId}` : "consult-45", payment_type: "razorpay" });
            const o = await post({ action: "order", plan, rideId, rideDate, guests, ghat, expert, minutes, concerns, meetDate, meetTime, name, phone, email, dob, birthTime, birthPlace });
            if (!o.success) throw new Error(o.message);
            await loadRazorpay();
            const rzp = new (window as any).Razorpay({
                key: o.keyId, order_id: o.orderId, amount: o.amount, currency: "INR",
                name: "KashiGo", description: combo ? "Boat ride + Google Meet with a guru" : `${CONSULT_ONLY_MINUTES}-min Google Meet with a guru`,
                image: "https://kashigo.in/icon-192.png", prefill: { name, email, contact: phone }, theme: { color: "#f97316" },
                handler: async (r: any) => {
                    // Razorpay has the money by now: land on /thank-you even if our check fails, and say so.
                    const v = await post({ action: "verify", ...r }).catch(() => ({ success: false }));
                    track("purchase", { transaction_id: o.booking, currency: "INR", value: o.totalInr, item_id: combo ? `combo-${rideId}` : "consult-45" });
                    const ride = RIDES_BY_POPULARITY.find((x) => x.id === rideId);
                    goToThankYou({
                        title: v.success ? "You're booked!" : "Payment received!",
                        message: v.success
                            ? `Confirmation sent to ${email}. We'll call you on ${phone} for your free ${FREE_CALL_MINUTES}-minute chat, then send your Google Meet link.`
                            : "We couldn't confirm it automatically. Please WhatsApp +91 81759 66910 with your payment ID and we'll confirm your booking.",
                        ref: { label: "Booking", value: o.booking },
                        rows: [
                            ...(combo && ride ? [["Boat ride", `${ride.short} · ${fmtDay(rideDate)}`]] as [string, string][] : []),
                            ["Google Meet", `${combo ? minutes : CONSULT_ONLY_MINUTES} min with ${chosenExpert?.name ?? ""} · ${fmtDay(meetDate)}, ${slotLabel(meetTime)}`],
                            ["Paid", inr(o.totalInr)], ["Payment ID", r.razorpay_payment_id],
                        ],
                        cta: { label: "Back to KashiGo", href: "/" },
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

    const input = "h-12 w-full rounded-xl border border-white/15 bg-white/[0.05] px-4 text-base text-white placeholder:text-white/35 outline-none transition-colors focus:border-marigold [color-scheme:dark]";
    const ready = !problem();

    return (
        <div className="grain relative w-full overflow-hidden bg-night pb-32 pt-24 text-white md:pt-32">
            <div aria-hidden className="absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,182,39,0.16),transparent_65%)]" />
            <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
                {/* Hero: what it is, the price, and the call on a laptop */}
                <div className="text-center">
                    <MeetBadge />
                    <h1 className="mt-4 font-display text-[2.4rem] font-light leading-[1.04] tracking-[-0.02em] sm:text-6xl">
                        {combo ? <>A boat ride on the Ganga, <em className="text-fire">and a guru on Google Meet.</em></> : <>Talk to a Kashi guru, <em className="text-fire">live on Google Meet.</em></>}
                    </h1>
                    {/* eslint-disable-next-line @next/next/no-img-element -- animated GIF */}
                    <img src="/consult/meet-guru.gif" alt="A guru on a Google Meet call, then a Lo Shu grid and a kundali chart" width={720} height={480}
                        className="mx-auto mt-6 w-full max-w-md rounded-2xl" />
                </div>

                {/* The two plans side by side — the combo is barely more than the session alone */}
                <div className="mt-6 grid grid-cols-2 gap-2.5">
                    {([
                        ["combo", "Ride + consultation", `from ${inr(COMBO_FROM_INR)}`, `Worth ${inr(COMBO_WORTH_INR)}`],
                        ["consult", "Consultation only", inr(CONSULT_ONLY_INR), `${CONSULT_ONLY_MINUTES}-min Google Meet`],
                    ] as const).map(([id, title, price, sub]) => (
                        <button key={id} type="button" onClick={() => setPlan(id)} aria-pressed={plan === id}
                            className={`relative rounded-2xl border-2 px-3 pb-3 pt-4 text-left transition-colors ${plan === id ? "border-[#e8c158] bg-[#e8c158]/15" : "border-white/10 bg-white/[0.03]"}`}>
                            {id === "combo" && <span className="absolute -top-2.5 left-3 rounded-full bg-[#7ee0c9] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-night">Best value</span>}
                            <span className="block text-sm font-semibold">{title}</span>
                            <span className="mt-1 block font-display text-2xl" style={{ color: GOLD }}>{price}</span>
                            <span className={`block text-xs ${id === "combo" ? "text-white/45 line-through" : "text-white/55"}`}>{sub}</span>
                        </button>
                    ))}
                </div>
                {combo && <p className="mt-2 text-center text-xs text-white/55">Only {inr(COMBO_FROM_INR - CONSULT_ONLY_INR)} more than the consultation alone — and your boat ride is included.</p>}

                <div className="relative mt-8 grid gap-8 rounded-[2rem] border-2 border-[#e8c158] bg-gradient-to-b from-[#1a1230] via-[#120d24] to-night p-5 shadow-[0_40px_100px_-30px_rgba(255,182,39,0.35)] sm:p-8">
                    {combo && (
                        <Step id="step-ride" n={1} title="Your boat ride" done={!!rideId && !!rideDate}>
                            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 pt-3">
                                {rideDays.map((d) => d.iso === DEV_DEEPAWALI_DAY ? (
                                    <Link key={d.iso} href={DEV_DEEPAWALI_PATH} className="relative w-[4.6rem] shrink-0 rounded-2xl border-2 border-[#e8c158]/50 bg-[#12348f] pb-2 pt-3 text-center">
                                        <span className="block text-[11px] font-semibold text-[#e8c158]">{d.top}</span>
                                        <span className="block font-display text-lg leading-tight">{d.bottom}</span>
                                        <span className="block text-[10px] font-semibold text-[#f3d27a]">Dev Diwali →</span>
                                    </Link>
                                ) : (
                                    <Chip key={d.iso} on={rideDate === d.iso} onClick={() => { setRideDate(d.iso); if (!rideId) goTo("step-ride-list"); }} className="w-[4.6rem] shrink-0 pb-2 pt-3">
                                        <span className="block text-[11px] font-semibold text-[#e8c158]">{d.top}</span>
                                        <span className="block font-display text-lg leading-tight">{d.bottom}</span>
                                        <span className="block text-[10px] text-white/50">{d.iso === todayIso ? "+30% ride" : "Best price"}</span>
                                    </Chip>
                                ))}
                            </div>
                            <div id="step-ride-list" className="mt-4 grid scroll-mt-24 gap-2.5">
                                {!rideDate && <p className="rounded-xl bg-white/[0.04] px-4 py-3 text-sm text-white/60">Pick a date above to see each ride&apos;s price for that day.</p>}
                                {rideDate && RIDES_BY_POPULARITY.map((r) => {
                                    const closed = todayIso ? bookingTimeProblem(rideDate, rideStartMinutes(r.id), now) : null;
                                    return (
                                        <Chip key={r.id} on={rideId === r.id} onClick={() => !closed && pickRide(r.id)} className={`flex items-center gap-3 p-3 text-left ${closed ? "opacity-40" : ""}`}>
                                            <Ship size={20} className="shrink-0 text-marigold" />
                                            <span className="min-w-0 flex-1">
                                                <span className="block font-semibold">{r.short}{r.badge && <span className="ml-2 rounded-full bg-marigold/20 px-2 py-0.5 text-[10px] font-bold uppercase text-marigold">{r.badge}</span>}</span>
                                                <span className="block text-xs text-white/55">{closed ? "Not available for this date" : r.time}</span>
                                            </span>
                                            <span className="text-right">
                                                <span className="block font-display text-lg" style={{ color: GOLD }}>{inr(ridePriceOn(r.id))}</span>
                                                <span className="block text-[10px] text-white/45">ride + Meet</span>
                                            </span>
                                        </Chip>
                                    );
                                })}
                                {rideDate && <p className="text-[11px] text-white/50">Price per boat, {FREE_PASSENGERS} people included. Each extra passenger adds {inr(EXTRA_PASSENGER_INR)}.</p>}
                            </div>
                        </Step>
                    )}

                    <Step id="step-guru" n={1 + s} title="Choose your guru" done={!!expert}>
                        <ul className="grid grid-cols-3 gap-2 sm:gap-4">
                            {EXPERTS.map((x) => (
                                <li key={x.slug}>
                                    <Chip on={x.slug === expert} onClick={() => pickExpert(x.slug)} className="flex w-full flex-col items-center p-2.5 sm:p-4">
                                        <span className={`relative block rounded-full p-[2px] ${x.slug === expert ? "bg-gradient-to-b from-[#f7dc8c] via-marigold to-[#9c6d1e]" : "bg-white/15"}`}>
                                            {/* eslint-disable-next-line @next/next/no-img-element -- square portrait in /public */}
                                            <img src={x.icon} alt="" className="h-16 w-16 rounded-full border-2 border-night object-cover sm:h-20 sm:w-20" />
                                            {x.slug === expert && <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-marigold text-night"><Check size={14} strokeWidth={3} /></span>}
                                        </span>
                                        <span className="mt-2 font-deva text-sm leading-tight sm:text-base">{x.nameDeva.replace(/^रामानुज दास /, "")}</span>
                                        <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-marigold">{x.title}</span>
                                    </Chip>
                                </li>
                            ))}
                        </ul>
                    </Step>

                    {combo && (
                        <Step id="step-length" n={3} title="How long would you like to talk?" done={!!expert && !!minutes}>
                            <div className="grid gap-2.5 sm:grid-cols-2">
                                {MEET_LENGTHS.map((l) => (
                                    <Chip key={l.minutes} on={minutes === l.minutes} onClick={() => pickLength(l.minutes)} className="flex items-center gap-3 p-4 text-left">
                                        {/* eslint-disable-next-line @next/next/no-img-element -- small product icon */}
                                        <img src="/consult/google-meet.svg" alt="" className="h-8 w-8 shrink-0" />
                                        <span className="flex-1">
                                            <span className="block font-semibold">{l.label}</span>
                                            <span className="block text-xs text-white/55">{l.minutes === 45 ? "Time for every question, and the remedies" : "Your main question, answered"}</span>
                                        </span>
                                        <span className={`text-sm font-bold ${l.addInr ? "text-white" : "text-[#7ee0c9]"}`}>{l.note}</span>
                                    </Chip>
                                ))}
                            </div>
                            <p className="mt-3 flex items-start gap-2 rounded-xl bg-[#7ee0c9]/10 px-3 py-2.5 text-sm text-[#bdf3e6] ring-1 ring-[#7ee0c9]/25">
                                <PhoneCall size={16} className="mt-0.5 shrink-0 text-[#7ee0c9]" /> Plus a <b className="mx-1">free {FREE_CALL_MINUTES}-minute call</b> first, so your guru knows your question before you meet.
                            </p>
                        </Step>
                    )}

                    <Step id="step-topics" n={combo ? 4 : 2} title="What would you like to ask about?" done={concerns.length > 0}>
                        <div className="flex flex-wrap gap-2">
                            {CONCERNS.map((c) => {
                                const on = concerns.includes(c);
                                return (
                                    <button key={c} type="button" onClick={() => toggleConcern(c)} aria-pressed={on}
                                        className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition-colors ${on ? "border-[#e8c158] bg-[#e8c158] text-night" : "border-[#e8c158]/40 bg-[#e8c158]/10 text-[#f3d27a] hover:bg-[#e8c158]/20"}`}>
                                        {on ? <Check size={14} strokeWidth={3} /> : <Plus size={14} />}{c}
                                    </button>
                                );
                            })}
                        </div>
                        <button type="button" onClick={() => goTo("step-slot")} disabled={!concerns.length}
                            className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-white/10 px-5 text-sm font-semibold disabled:opacity-40">
                            Next: pick a time <ArrowRight size={15} />
                        </button>
                    </Step>

                    <Step id="step-slot" n={combo ? 5 : 3} title="When should we meet?" done={!!meetDate && !!meetTime && slotOpen(meetTime)}>
                        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                            {meetDays.map((d) => (
                                <Chip key={d.iso} on={meetDate === d.iso} onClick={() => { setMeetDate(d.iso); setMeetTime(""); }} className="w-[4.6rem] shrink-0 py-2.5">
                                    <span className="block text-[11px] font-semibold text-[#e8c158]">{d.top}</span>
                                    <span className="block font-display text-lg leading-tight">{d.bottom}</span>
                                </Chip>
                            ))}
                        </div>
                        {meetDate ? (
                            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                                {MEET_SLOTS.map((t) => {
                                    const open = slotOpen(t);
                                    return (
                                        <Chip key={t} on={meetTime === t} onClick={() => open && pickSlot(t)} className={`py-2.5 text-sm font-semibold ${open ? "" : "opacity-30"}`}>{slotLabel(t)}</Chip>
                                    );
                                })}
                            </div>
                        ) : <p className="mt-3 text-sm text-white/55">Pick a day to see the times.</p>}
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-white/50"><Clock size={13} /> India time. Your Google Meet link comes by email and WhatsApp.</p>
                    </Step>

                    <Step id="step-details" n={combo ? 6 : 4} title="Your details" done={false}>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" autoComplete="name" className={`${input} sm:col-span-2`} />
                            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone / WhatsApp" type="tel" inputMode="tel" autoComplete="tel" className={input} />
                            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (your Meet link goes here)" type="email" autoComplete="email" className={input} />
                        </div>
                        {combo && (
                            <>
                                <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-white/[0.05] px-3 py-2 ring-1 ring-white/10">
                                    <span className="text-sm text-white/80">People on the boat <span className="block text-[11px] text-white/45">{FREE_PASSENGERS} included · +{inr(EXTRA_PASSENGER_INR)} each after that</span></span>
                                    <span className="flex items-center gap-2">
                                        <button type="button" aria-label="Fewer people" onClick={() => setGuests((g) => Math.max(1, g - 1))} disabled={guests <= 1} className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#e8c158] text-[#f3d27a] disabled:opacity-40"><Minus size={16} /></button>
                                        <span className="w-6 text-center font-display text-2xl tabular-nums">{guests}</span>
                                        <button type="button" aria-label="More people" onClick={() => setGuests((g) => Math.min(MAX_GUESTS, g + 1))} disabled={guests >= MAX_GUESTS} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8c158] text-night disabled:opacity-40"><Plus size={16} /></button>
                                    </span>
                                </div>
                                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/55">Your boat starts from</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {GHATS.map((g) => (
                                        <Chip key={g} on={ghat === g} onClick={() => setGhat(g)} className="px-3.5 py-2 text-sm font-semibold">{g.replace(" Ghat", "")}</Chip>
                                    ))}
                                </div>
                            </>
                        )}
                        <details className="group mt-4 rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/10">
                            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-white/85">
                                <span className="inline-flex items-center gap-2"><Sparkles size={15} className="text-marigold" /> Add your birth details <span className="font-normal text-white/45">(optional — helps your guru prepare)</span></span>
                                <ChevronDown size={16} className="transition-transform group-open:rotate-180" />
                            </summary>
                            <div className="mt-3 grid gap-3 sm:grid-cols-3">
                                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} max={todayIso || undefined} aria-label="Date of birth" className={input} />
                                <input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} aria-label="Time of birth" className={input} />
                                <input value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} placeholder="Place of birth" className={input} />
                            </div>
                        </details>
                    </Step>

                    {/* Summary + pay */}
                    <div ref={payRef} id="step-pay" className="scroll-mt-24 rounded-2xl bg-white/[0.05] p-4 text-sm ring-1 ring-white/10">
                        {combo ? (
                            <>
                                <div className="flex justify-between text-white/75"><span>Boat ride{rideId ? ` · ${RIDES_BY_POPULARITY.find((r) => r.id === rideId)?.short}` : ""}</span><span className="tabular-nums">{quote.boatInr ? inr(quote.boatInr) : "—"}</span></div>
                                {quote.noticeInr > 0 && <div className="flex justify-between text-white/60"><span>Booking for today (+30% on the boat)</span><span className="tabular-nums">{inr(quote.noticeInr)}</span></div>}
                                {quote.guestInr > 0 && <div className="flex justify-between text-white/60"><span>{guests - FREE_PASSENGERS} extra passenger{guests - FREE_PASSENGERS === 1 ? "" : "s"}</span><span className="tabular-nums">{inr(quote.guestInr)}</span></div>}
                                <div className="flex justify-between text-white/75"><span>{minutes}-min Google Meet{chosenExpert ? ` with ${chosenExpert.name.replace(/^Ramanuj Das /, "")}` : ""}</span><span className="tabular-nums">{inr(quote.consultInr)}</span></div>
                                <div className="flex justify-between text-white/45"><span>Bought on its own, a session is</span><s className="tabular-nums">{inr(CONSULT_ONLY_INR)}</s></div>
                            </>
                        ) : (
                            <div className="flex justify-between text-white/75"><span>{CONSULT_ONLY_MINUTES}-min Google Meet{chosenExpert ? ` with ${chosenExpert.name.replace(/^Ramanuj Das /, "")}` : ""}</span><span className="tabular-nums">{inr(CONSULT_ONLY_INR)}</span></div>
                        )}
                        <div className="mt-2 flex justify-between border-t border-white/10 pt-2 text-base font-bold"><span>Total</span><span className="tabular-nums" style={{ color: GOLD }}>{combo && !rideId ? `from ${inr(COMBO_FROM_INR)}` : inr(quote.totalInr)}</span></div>
                        {!combo && (
                            <button type="button" onClick={() => { setPlan("combo"); goTo("step-ride"); }} className="mt-3 w-full rounded-xl bg-[#7ee0c9]/10 px-3 py-2.5 text-left text-xs font-semibold text-[#7ee0c9] ring-1 ring-[#7ee0c9]/30">
                                Add a boat ride on the Ganga from just {inr(COMBO_FROM_INR - CONSULT_ONLY_INR)} more → switch to Ride + consultation
                            </button>
                        )}
                    </div>

                    {error && <p role="alert" className="rounded-xl bg-ember/15 px-4 py-3 text-sm font-medium text-[#ffb3a6]">{error}</p>}
                    <div>
                        <button type="button" onClick={pay} disabled={busy}
                            className="btn-sheen flex h-16 w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-marigold via-fire to-ember text-lg font-extrabold text-night shadow-[0_14px_40px_-10px_rgba(255,122,26,0.9)] disabled:opacity-70">
                            {busy ? <Loader2 size={20} className="animate-spin" /> : <Lock size={18} />}
                            {busy ? "Opening secure checkout…" : ready ? `Book & pay ${inr(quote.totalInr)}` : "Book now"}
                        </button>
                        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-white/55"><ShieldCheck size={14} className="text-[#7ee0c9]" /> UPI · Cards · Net banking — processed by Razorpay. 100% money-back guarantee.</p>
                    </div>
                </div>
            </div>

            {/* Phones: the running total and the next step, always in reach */}
            <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-[#e8c158]/40 bg-night/95 px-4 pb-[calc(0.625rem+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur sm:hidden">
                <div className="flex-1 leading-tight">
                    <p className="text-[11px] text-white/60">{combo ? "Ride + Google Meet" : `${CONSULT_ONLY_MINUTES}-min Google Meet`}</p>
                    <p className="font-display text-xl" style={{ color: GOLD }}>{combo && !rideId ? `from ${inr(COMBO_FROM_INR)}` : inr(quote.totalInr)}</p>
                </div>
                <button type="button" onClick={ready ? pay : () => { const p = problem(); if (p) goTo(p.at); }} disabled={busy}
                    className="h-11 rounded-full bg-gradient-to-r from-marigold via-fire to-ember px-6 text-sm font-extrabold text-night">{ready ? "Pay now" : "Continue"}</button>
            </div>
        </div>
    );
}
