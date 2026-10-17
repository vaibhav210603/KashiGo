"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Check, Minus, Plus, Phone, Headphones, Wallet, Smartphone, Globe, Tag, Coins, LogOut } from "lucide-react";
import { BOAT_PRICES_INR } from "@/lib/boatPrices";
import { RIDES_BY_POPULARITY, CUSTOM_RIDE, GHATS, BoatRideId, inr, istNow, addDaysIso, bookingTimeProblem, rideStartMinutes, BOOKING_WINDOW_DAYS } from "@/lib/boatRides";
import { track } from "@/lib/analytics";
import { money, useCurrency } from "@/lib/currency";
import { formatPhone } from "@/lib/phone";
import { apiPost, authHeaders, useAuth } from "@/components/auth/useAuth";
import { useAccount } from "@/components/auth/useAccount";
import PhoneLogin from "@/components/auth/PhoneLogin";
import { FIRE_BTN } from "@/components/ui/styles";

type RideChoice = BoatRideId | "custom" | "";
type PayMode = "cod" | "online_domestic" | "online_international";
type Field = "ride" | "customTime" | "customDest" | "date" | "ghat" | "name" | "phone";

// India time, re-read every 30s so "today" and same-day cut-offs stay right while the page is open.
// Empty on the server, so prerendered HTML never bakes in a stale date.
const subscribeClock = (tick: () => void) => { const t = setInterval(tick, 30_000); return () => clearInterval(t); };
const readClock = () => { const n = istNow(); return `${n.iso}|${n.minutes}`; };
const serverClock = () => "";

// Labels for an ISO date, computed in UTC so the visitor's own timezone can't shift the day.
const dayLabel = (iso: string, i: number) => {
    const d = new Date(`${iso}T00:00:00Z`);
    return {
        iso,
        top: i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-IN", { weekday: "short", timeZone: "UTC" }),
        bottom: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" }),
    };
};

const slotFor = (time: string) => {
    const h = Number(time.split(":")[0]);
    return h < 11 ? "Morning" : h < 17 ? "Afternoon" : "Evening";
};

function Section({ id, n, title, error, children }: { id: string; n: number; title: string; error?: string; children: React.ReactNode }) {
    return (
        <section id={id} className="scroll-mt-28 rounded-[1.75rem] border border-night/10 bg-[#fffaf0] p-4 sm:p-7 shadow-[0_20px_50px_-35px_rgba(60,30,0,0.45)]">
            <h2 className="flex items-baseline gap-3 font-display text-2xl tracking-tight text-night">
                <span className="font-display italic text-lg text-fire">0{n}</span>
                {title}
            </h2>
            <div className="mt-5">{children}</div>
            {error && <p className="mt-3 text-sm font-medium text-ember">{error}</p>}
        </section>
    );
}

const chip = (on: boolean) =>
    `shrink-0 min-h-11 px-4 rounded-full border text-sm font-semibold transition-colors ${on ? "bg-night border-night text-marigold" : "bg-white/60 border-night/15 text-night/75 hover:border-night/40"}`;

const input = "w-full h-12 rounded-2xl border border-night/15 bg-white/70 px-4 text-[16px] text-night placeholder:text-night/35 outline-none transition focus:border-fire focus:bg-white focus:ring-4 focus:ring-marigold/20";

export default function BookingFlow() {
    const [ride, setRide] = useState<RideChoice>("");
    const [customTime, setCustomTime] = useState("");
    const [tripType, setTripType] = useState<"round" | "single">("round");
    const [dest, setDest] = useState("");
    const [date, setDate] = useState("");
    const [ghat, setGhat] = useState("");
    const [guests, setGuests] = useState(2);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [pay, setPay] = useState<PayMode>("online_domestic"); // matches the server-rendered ₹; switches with the currency
    const [currency] = useCurrency();
    // Picking $ or ₹ in the header also picks the matching way to pay (still changeable below).
    const [payCurrency, setPayCurrency] = useState(currency);
    if (currency !== payCurrency) {
        setPayCurrency(currency);
        if (currency === "usd" && pay === "online_domestic") setPay("online_international");
        if (currency === "inr" && pay === "online_international") setPay("online_domestic");
    }
    const [busy, setBusy] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
    const [notice, setNotice] = useState("");
    const [code, setCode] = useState("");
    const [applied, setApplied] = useState<{ product: string; inr: number } | null>(null);
    const [codeMsg, setCodeMsg] = useState("");
    const [done, setDone] = useState<{ rideId: string; paid: boolean } | null>(null);
    // Phone login unlocks discount codes and KashiGo coins (refunds come back as coins).
    const auth = useAuth();
    const { account, refresh: refreshAccount } = useAccount();
    const [showLogin, setShowLogin] = useState(false);
    const [useCoins, setUseCoins] = useState(true);
    // Logged in with an empty phone field: fill in the verified number for the boatman.
    const [filledFor, setFilledFor] = useState<string | null>(null);
    if (auth.phone && auth.phone !== filledFor) {
        setFilledFor(auth.phone);
        if (!phone.trim()) setPhone(formatPhone(auth.phone));
    }
    const topRef = useRef<HTMLDivElement>(null);

    // Arrive with a ride already chosen from the homepage (/book?ride=p5). The way to pay follows the
    // visitor's currency (₹ → UPI, $ → PayPal), which defaults by timezone — see useCurrency.
    useEffect(() => {
        const q = new URLSearchParams(window.location.search).get("ride");
        if (q === "custom" || RIDES_BY_POPULARITY.some((r) => r.id === q)) setRide(q as RideChoice);
    }, []);

    const clock = useSyncExternalStore(subscribeClock, readClock, serverClock);
    const [todayIso, nowMinutes] = clock ? [clock.split("|")[0], Number(clock.split("|")[1])] : ["", 0];
    const dates = useMemo(() => (todayIso ? Array.from({ length: BOOKING_WINDOW_DAYS }, (_, i) => dayLabel(addDaysIso(todayIso, i), i)) : []), [todayIso]);
    // A date left selected past midnight falls back to the new "today".
    const selectedDate = date && date >= todayIso ? date : todayIso;

    const selected = RIDES_BY_POPULARITY.find((r) => r.id === ride);
    const listPrice = ride === "custom" ? BOAT_PRICES_INR.custom : selected ? BOAT_PRICES_INR[selected.id] : 0;
    const product = ride === "custom" ? "custom-boat" : ride;
    // A code is priced for one ride and only applies to online payment.
    const codePrice = applied && applied.product === product ? applied.inr : null;
    const coupon = codePrice !== null && pay !== "cod" ? code.trim().toUpperCase() : undefined;
    const afterCode = coupon ? codePrice! : listPrice;
    // Coins only apply to online payment. If they cover the whole ride, there's nothing to pay (mode "credits");
    // otherwise at least ₹1 is left for Razorpay / PayPal. The server recomputes all of this.
    const balance = account?.credits ?? 0;
    const coinsOn = useCoins && balance > 0 && pay !== "cod" && afterCode > 0;
    const coversAll = coinsOn && balance >= afterCode;
    const coinsUsed = !coinsOn ? 0 : coversAll ? afterCode : Math.min(balance, afterCode - 1);
    const price = afterCode - coinsUsed;
    const payMode = coversAll ? "credits" : pay;
    const rideLabel = ride === "custom" ? CUSTOM_RIDE.short : selected?.short || "";
    const dateLabel = dates.find((d) => d.iso === selectedDate);
    // Shown live under the date picker as soon as a ride (and custom start time) is chosen.
    const timeProblem = todayIso && ride && (ride !== "custom" || customTime)
        ? bookingTimeProblem(selectedDate, rideStartMinutes(ride, customTime), { iso: todayIso, minutes: nowMinutes })
        : null;

    const applyCode = async () => {
        const c = code.trim().toUpperCase();
        if (!c) return;
        if (!product) { setCodeMsg("Choose a ride first."); return; }
        try {
            if (!auth.loggedIn) { setShowLogin(true); setCodeMsg("Log in with your phone number to use a code."); return; }
            const { data } = await apiPost("/api/coupon", { product, code: c });
            if (data.needsLogin) { setShowLogin(true); setCodeMsg(data.message); return; }
            if (data.valid && typeof data.inr === "number") { setApplied({ product, inr: data.inr }); setCodeMsg(`Code applied — you pay ${money(data.inr, currency)}`); return; }
            if (data.message) { setApplied(null); setCodeMsg(data.message); return; }
        } catch { }
        setApplied(null); setCodeMsg("That code isn't valid.");
    };

    const validate = () => {
        const e: Partial<Record<Field, string>> = {};
        if (!ride) e.ride = "Choose a ride to continue.";
        if (ride === "custom" && !customTime) e.customTime = "Pick a start time for your custom ride.";
        if (ride === "custom" && tripType === "single" && !dest) e.customDest = "Choose where the boat should drop you.";
        if (ride === "custom" && tripType === "single" && dest && dest === ghat) e.customDest = "Pick a drop-off ghat different from where you start.";
        if (!todayIso) e.date = "Loading dates — one moment.";
        else if (timeProblem) e.date = timeProblem;
        if (!ghat) e.ghat = "Choose the ghat you'll start from.";
        if (!name.trim()) e.name = "Add the lead passenger's name.";
        if (phone.replace(/\D/g, "").length < 8) e.phone = "Add a phone number so your boatman can reach you.";
        return e;
    };
    const isValid = Object.keys(validate()).length === 0;

    const showErrors = () => {
        const e = validate();
        setErrors(e);
        const first = (Object.keys(e) as Field[])[0];
        if (first) {
            const target = first === "customTime" || first === "customDest" ? "ride" : first === "phone" ? "name" : first;
            document.getElementById(`s-${target === "name" ? "details" : target}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
            return false;
        }
        return true;
    };

    const payload = (paymentRef?: string) => ({
        ghat,
        rideDate: selectedDate,
        timeOfDay: ride === "custom" ? `${slotFor(customTime)}, ${customTime}` : `${selected!.slot}, ${selected!.time}`,
        boatType: "Private",
        experienceType: ride === "custom" ? "custom" : "package",
        packageId: ride === "custom" ? "" : ride,
        customDetails: { time: customTime, tripType, destinationGhat: tripType === "single" ? dest : "" },
        paymentMode: payMode,
        passengerDetails: { name: name.trim(), phone: phone.trim(), email: email.trim(), passengersCount: guests },
        amount: price,
        coupon,
        razorpayPaymentId: paymentRef,
    });

    // Once a payment reference exists the customer has paid: always confirm — the server alerts the owner if anything needs follow-up.
    const submitBooking = async (paymentRef?: string) => {
        let rideId = "";
        try {
            const res = await fetch("/api/booking", { method: "POST", headers: await authHeaders(), body: JSON.stringify(payload(paymentRef)) });
            const data = await res.json();
            if (data.success) rideId = data.rideId;
            else if (payMode === "credits" && data.message) { setNotice(data.message); refreshAccount(); return; }
        } catch { }
        if (!rideId && !paymentRef) {
            setNotice("We couldn't place your booking — please check your connection and try again, or call +91 81759 66910.");
            return;
        }
        const finalRideId = rideId || `KASHI-${String(paymentRef).slice(-6).toUpperCase()}`;
        const paid = Boolean(paymentRef) || payMode === "credits";
        setDone({ rideId: finalRideId, paid });
        if (coinsUsed) refreshAccount();
        // Only paid rides are revenue; pay-at-ghat bookings are leads until the boatman is paid.
        if (paid) track("purchase", { transaction_id: finalRideId, currency: "INR", value: price, item_id: product });
        else track("generate_lead", { lead_source: "boat_booking_pay_at_ghat", currency: "INR", value: price });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // PayPal keeps the callbacks from when its button first rendered; route them through a ref
    // so a booking always uses what's on screen now, not what was there when the button appeared.
    const submitRef = useRef(submitBooking);
    useEffect(() => { submitRef.current = submitBooking; });

    const payRazorpay = async () => {
        track("begin_checkout", { currency: "INR", value: price, item_id: product, payment_type: "razorpay" });
        const order = await apiPost("/api/razorpay", { product, coupon, useCredits: coinsOn }).then((r) => r.data).catch(() => ({ success: false }));
        if (!order.success && order.message) { setNotice(order.message); return; }
        if (!order.success) { setNotice("Online payment isn't available right now — choose “Pay at the ghat” or try again."); return; }
        await new Promise<void>((resolve, reject) => {
            if ((window as any).Razorpay) return resolve();
            const s = document.createElement("script");
            s.src = "https://checkout.razorpay.com/v1/checkout.js";
            s.onload = () => resolve(); s.onerror = () => reject();
            document.body.appendChild(s);
        }).catch(() => { throw new Error("load"); });
        await new Promise<void>((resolve) => {
            const rzp = new (window as any).Razorpay({
                key: order.keyId, amount: order.amount, currency: order.currency, order_id: order.orderId,
                name: "KashiGo", description: `${rideLabel} · ${dateLabel?.bottom} · ${ghat}`, image: "/icon.png",
                prefill: { name, email, contact: phone }, theme: { color: "#f97316" },
                handler: async (r: any) => { await submitBooking(r.razorpay_payment_id); resolve(); },
                modal: { ondismiss: () => resolve() },
            });
            rzp.open();
        });
    };

    const confirm = async () => {
        setNotice("");
        if (!showErrors()) return;
        if (payMode === "online_international") {
            document.getElementById("paypal")?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }
        setBusy(true);
        try {
            if (payMode === "cod" || payMode === "credits") await submitBooking();
            else await payRazorpay();
        } catch {
            setNotice("Couldn't open the payment window — check your connection or choose “Pay at the ghat”.");
        } finally {
            setBusy(false);
        }
    };

    if (done) {
        return (
            <div ref={topRef} className="grain relative overflow-hidden rounded-[2rem] bg-night p-6 sm:p-10 text-center text-white shadow-[0_40px_90px_-30px_rgba(7,11,24,0.7)]">
                <div aria-hidden className="flicker absolute -right-16 -top-20 h-60 w-60 rounded-full bg-fire/35 blur-[80px]" />
                <div className="relative w-20 h-20 mx-auto rounded-full bg-ganga/15 text-ganga ring-1 ring-ganga/40 flex items-center justify-center"><Check size={40} /></div>
                <h2 className="relative mt-5 font-display font-light text-4xl sm:text-5xl tracking-tight">You&apos;re <em className="text-fire pr-1">booked!</em></h2>
                <p className="relative mt-2 text-white/60">{email ? `Confirmation sent to ${email}.` : "Keep your ride number handy."}</p>
                <div className="relative mt-6 mx-auto max-w-sm rounded-2xl border border-dashed border-marigold/50 bg-white/5 p-5">
                    <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/45">Your ride number</p>
                    <p className="mt-1 font-mono font-bold text-2xl text-marigold">{done.rideId}</p>
                </div>
                <dl className="relative mt-6 mx-auto max-w-sm text-left text-[15px] divide-y divide-white/10">
                    {[
                        ["Ride", rideLabel],
                        ["When", `${dateLabel?.top}, ${dateLabel?.bottom} · ${ride === "custom" ? customTime : selected?.time}`],
                        ["From", ghat],
                        ["Guests", String(guests)],
                        ["Total", `${money(price, currency)}${currency === "usd" ? ` (${inr(price)})` : ""} · ${done.paid ? "paid" : "pay at the ghat"}`],
                    ].map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-4 py-2"><dt className="text-white/50">{k}</dt><dd className="font-semibold text-white text-right">{v}</dd></div>
                    ))}
                </dl>
                <a href="tel:+918175966910" className="relative mt-6 inline-flex items-center gap-2 h-12 px-6 rounded-full border border-white/20 font-semibold text-white transition-colors hover:border-marigold">
                    <Phone size={18} className="text-marigold" /> Questions? +91 81759 66910
                </a>
                <Link href="/audiobooks#walk-the-ghats" className="relative mt-8 block rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition-colors hover:border-marigold/50">
                    <p className="flex items-center gap-2 font-semibold text-white"><Headphones size={18} className="text-marigold" /> Before or after your ride</p>
                    <p className="text-sm text-white/60">Walk the Ghats — a local&apos;s 90-minute audio tour from Assi to Manikarnika. →</p>
                </Link>
            </div>
        );
    }

    return (
        <div ref={topRef} className="space-y-4">
            <Section id="s-ride" n={1} title="Choose your ride" error={errors.ride || errors.customTime || errors.customDest}>
                <div className="grid grid-cols-2 gap-3">
                    {[...RIDES_BY_POPULARITY.map((r) => ({ id: r.id as RideChoice, short: r.short, time: r.time, image: r.image, badge: r.badge, price: BOAT_PRICES_INR[r.id] })),
                    { id: "custom" as RideChoice, short: CUSTOM_RIDE.short, time: "Your time", image: CUSTOM_RIDE.image, badge: undefined, price: BOAT_PRICES_INR.custom }].map((r) => {
                        const on = ride === r.id;
                        return (
                            <button key={r.id} type="button" onClick={() => { setRide(r.id); setErrors((e) => ({ ...e, ride: undefined })); }}
                                aria-pressed={on}
                                className={`group relative text-left rounded-2xl overflow-hidden ring-2 transition-all duration-500 ${on ? "ring-fire shadow-[0_16px_40px_-16px_rgba(255,122,26,0.8)]" : "ring-transparent hover:-translate-y-0.5"}`}>
                                <div className="relative aspect-[4/3]">
                                    <Image src={r.image} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width:640px) 45vw, 300px" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-transparent" />
                                    {r.badge && <span className="absolute top-2 left-2 rounded-full bg-marigold px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-night">{r.badge}</span>}
                                    {on && <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-gradient-to-br from-marigold to-ember text-night inline-flex items-center justify-center"><Check size={16} strokeWidth={3} /></span>}
                                    <div className="absolute bottom-0 inset-x-0 p-3 text-white">
                                        <p className="font-display text-lg leading-tight">{r.short}</p>
                                        <p className="text-xs text-white/75">{r.time} · <b className="text-marigold">{money(r.price, currency)}</b></p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {ride === "custom" && (
                    <div className="mt-4 grid gap-3 rounded-2xl bg-parchment-2/60 p-4">
                        <label className="text-sm font-semibold text-night/75">Start time
                            <input type="time" value={customTime} onChange={(e) => { setCustomTime(e.target.value); setErrors((x) => ({ ...x, customTime: undefined })); }} className={`${input} mt-1`} />
                        </label>
                        <div className="flex gap-2">
                            <button type="button" className={chip(tripType === "round")} onClick={() => setTripType("round")}>Round trip</button>
                            <button type="button" className={chip(tripType === "single")} onClick={() => setTripType("single")}>One way</button>
                        </div>
                        {tripType === "single" && (
                            <label className="text-sm font-semibold text-night/75">Drop me at
                                <select value={dest} onChange={(e) => { setDest(e.target.value); setErrors((x) => ({ ...x, customDest: undefined })); }} className={`${input} mt-1`}>
                                    <option value="">Choose a ghat</option>
                                    {GHATS.map((g) => <option key={g}>{g}</option>)}
                                </select>
                            </label>
                        )}
                    </div>
                )}
            </Section>

            <Section id="s-date" n={2} title="Pick a date" error={timeProblem || errors.date}>
                <div className="rail -mx-4 sm:-mx-6 px-4 sm:px-6">
                    {dates.map((d) => (
                        <button key={d.iso} type="button" onClick={() => { setDate(d.iso); setErrors((e) => ({ ...e, date: undefined })); }} aria-pressed={selectedDate === d.iso}
                            className={`w-[4.6rem] py-2.5 rounded-2xl border text-center transition-colors ${selectedDate === d.iso ? "bg-night border-night text-white" : "bg-white/60 border-night/15 text-night/75 hover:border-night/40"}`}>
                            <span className={`block text-xs font-semibold ${selectedDate === d.iso ? "text-marigold" : ""}`}>{d.top}</span>
                            <span className="block font-display text-lg leading-tight">{d.bottom}</span>
                        </button>
                    ))}
                </div>
            </Section>

            <Section id="s-ghat" n={3} title="Start from" error={errors.ghat}>
                <div className="flex flex-wrap gap-2">
                    {GHATS.map((g) => (
                        <button key={g} type="button" className={chip(ghat === g)} aria-pressed={ghat === g}
                            onClick={() => { setGhat(g); setErrors((e) => ({ ...e, ghat: undefined })); }}>{g.replace(" Ghat", "")}</button>
                    ))}
                </div>
                <p className="mt-3 text-xs text-night/50">Not sure? Dashashwamedh is closest to the evening Aarti.</p>
            </Section>

            <Section id="s-details" n={4} title="Your details" error={errors.name || errors.phone}>
                <div className="grid gap-3">
                    <input value={name} onChange={(e) => { setName(e.target.value); setErrors((x) => ({ ...x, name: undefined })); }} placeholder="Lead passenger name" autoComplete="name" className={input} />
                    <input value={phone} onChange={(e) => { setPhone(e.target.value); setErrors((x) => ({ ...x, phone: undefined })); }} placeholder="Phone number" type="tel" inputMode="tel" autoComplete="tel" className={input} />
                    <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (for your confirmation)" type="email" autoComplete="email" className={input} />
                    <div className="flex items-center justify-between rounded-2xl border border-night/15 bg-white/40 px-4 h-14">
                        <span className="font-medium text-night/75">Guests</span>
                        <div className="flex items-center gap-3">
                            <button type="button" aria-label="Fewer guests" onClick={() => setGuests((g) => Math.max(1, g - 1))} className="w-10 h-10 rounded-full border border-night/15 text-night inline-flex items-center justify-center transition-colors hover:bg-night hover:text-marigold"><Minus size={18} /></button>
                            <span className="w-6 text-center font-display text-xl text-night">{guests}</span>
                            <button type="button" aria-label="More guests" onClick={() => setGuests((g) => Math.min(20, g + 1))} className="w-10 h-10 rounded-full border border-night/15 text-night inline-flex items-center justify-center transition-colors hover:bg-night hover:text-marigold"><Plus size={18} /></button>
                        </div>
                    </div>
                    <p className="text-xs text-night/50">The price is for the whole private boat — not per person.</p>
                </div>
            </Section>

            <Section id="s-pay" n={5} title="How would you like to pay?">
                <div className="grid gap-2">
                    {([
                        ["online_domestic", Smartphone, "UPI / Indian card", "Pay now in ₹ · Razorpay"],
                        ["online_international", Globe, "International card / PayPal", "Pay now in $ · secure PayPal checkout"],
                        ["cod", Wallet, "Pay at the ghat", "Cash or UPI to your boatman"],
                    ] as const).map(([mode, Icon, title, sub]) => (
                        <button key={mode} type="button" onClick={() => setPay(mode)} aria-pressed={pay === mode}
                            className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${pay === mode ? "border-night bg-night text-white" : "border-night/15 bg-white/50 hover:border-night/40"}`}>
                            <Icon size={22} className={pay === mode ? "text-marigold" : "text-night/35"} />
                            <span className="flex-1"><span className={`block font-semibold ${pay === mode ? "text-white" : "text-night"}`}>{title}</span><span className={`block text-sm ${pay === mode ? "text-white/55" : "text-night/50"}`}>{sub}</span></span>
                            <span className={`w-5 h-5 rounded-full border-2 ${pay === mode ? "border-marigold bg-marigold shadow-[inset_0_0_0_3px_#070b18]" : "border-night/25"}`} />
                        </button>
                    ))}
                </div>

                {pay !== "cod" && (
                    <div className="mt-4">
                        <label htmlFor="booking-code" className="flex items-center gap-2 text-sm font-semibold text-night/75"><Tag size={16} className="text-fire" /> Discount code</label>
                        <div className="mt-2 flex gap-2">
                            <input id="booking-code" value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setApplied(null); setCodeMsg(""); }}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyCode(); } }}
                                placeholder="Have a code?" autoComplete="off" className={`${input} uppercase`} />
                            <button type="button" onClick={applyCode} className="h-12 px-5 rounded-2xl border border-night/20 bg-transparent font-semibold text-night transition-colors hover:bg-night hover:text-marigold whitespace-nowrap">Apply</button>
                        </div>
                        {codeMsg && (codePrice !== null || !applied) && <p className={`mt-2 text-sm font-medium ${codePrice !== null ? "text-[#1d7f76]" : "text-ember"}`}>{codeMsg}</p>}
                    </div>
                )}

                {/* Phone login: needed for codes, and where refunded KashiGo coins are spent */}
                {pay !== "cod" && (
                    <div className="mt-4 rounded-2xl border border-night/10 bg-white/60 p-4">
                        {auth.loggedIn ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-3 text-sm">
                                    <span className="text-night/60">Logged in as <b className="text-night">{formatPhone(auth.phone)}</b></span>
                                    <button type="button" onClick={() => { auth.signOut(); setApplied(null); setCodeMsg(""); }} className="inline-flex items-center gap-1 text-night/50 hover:text-night"><LogOut size={14} /> Log out</button>
                                </div>
                                {balance > 0 ? (
                                    <label className={`flex items-center gap-3 rounded-2xl border p-3 cursor-pointer transition-colors ${useCoins ? "border-night bg-night text-white" : "border-night/15 bg-white/70"}`}>
                                        <input type="checkbox" checked={useCoins} onChange={(e) => setUseCoins(e.target.checked)} className="h-5 w-5 accent-[#ff7a1a]" />
                                        <Coins size={20} className="text-marigold shrink-0" />
                                        <span className="flex-1 text-sm">
                                            <span className="block font-semibold">Use my KashiGo coins</span>
                                            <span className={`block ${useCoins ? "text-white/60" : "text-night/50"}`}>{balance.toLocaleString("en-IN")} coins available (1 coin = ₹1){coinsOn ? ` · using ${coinsUsed.toLocaleString("en-IN")}` : ""}</span>
                                        </span>
                                    </label>
                                ) : (
                                    <p className="text-xs text-night/50">No KashiGo coins yet — refunds come back here as coins you can spend on any ride or guide.</p>
                                )}
                                {coversAll && <p className="text-sm font-medium text-[#1d7f76]">Your coins cover this ride — no payment needed.</p>}
                            </div>
                        ) : showLogin ? (
                            <PhoneLogin defaultCode={currency === "inr" ? "+91" : "+1"} subtitle="Unlocks discount codes and your KashiGo coins." onDone={() => { setShowLogin(false); setCodeMsg(""); }} />
                        ) : (
                            <button type="button" onClick={() => setShowLogin(true)} className="flex w-full items-center gap-3 text-left">
                                <Coins size={20} className="text-fire shrink-0" />
                                <span className="flex-1 text-sm"><span className="block font-semibold text-night">Have a code or KashiGo coins?</span><span className="block text-night/50">Log in with your phone number — takes 20 seconds.</span></span>
                                <span className="text-sm font-semibold text-fire">Log in</span>
                            </button>
                        )}
                    </div>
                )}

                {payMode === "online_international" && (
                    <div id="paypal" className="mt-4 scroll-mt-24">
                        {isValid ? (
                            <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "ATMGtSsoMxvX5hrhLzFYYuN1yNCAonxN-vV1xAtNKBRvL7cbgpMQ_EG1Nf7j-43XGcyyUlN6Eb4Our_0", currency: "USD" }}>
                                <PayPalButtons
                                    forceReRender={[product, coupon, coinsOn]}
                                    style={{ layout: "vertical", color: "gold", shape: "pill", label: "pay", height: 48 }}
                                    createOrder={async () => {
                                        const { data: o } = await apiPost("/api/paypal/create-order", { product, coupon, useCredits: coinsOn });
                                        if (!o.success) { if (o.message) setNotice(o.message); throw new Error("Could not create PayPal order"); }
                                        return o.orderId;
                                    }}
                                    onApprove={async (data) => {
                                        // Approved by the customer: always confirm; the server re-checks the order with PayPal.
                                        setBusy(true);
                                        try {
                                            await fetch("/api/paypal/capture-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: data.orderID }) });
                                        } catch { }
                                        await submitRef.current(data.orderID);
                                        setBusy(false);
                                    }}
                                    onError={() => setNotice("PayPal didn't open — try again, or choose “Pay at the ghat”.")}
                                />
                            </PayPalScriptProvider>
                        ) : (
                            <p className="rounded-2xl border border-dashed border-night/20 p-4 text-sm text-night/60">Fill in the steps above and the PayPal button appears here.</p>
                        )}
                    </div>
                )}
            </Section>

            {notice && <p role="alert" className="rounded-2xl border border-ember/30 bg-ember/10 p-4 text-sm font-medium text-[#b3311a]">{notice}</p>}

            {/* Sticky summary + one action, always in thumb reach */}
            <div className="fixed bottom-0 inset-x-0 z-40 bg-night/90 backdrop-blur-xl border-t border-white/10 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
                <div className="max-w-3xl mx-auto flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/50 truncate">{rideLabel ? `${rideLabel} · ${dateLabel?.top}` : "Choose a ride"}</p>
                        <p className="font-display text-2xl text-white">
                            {(coupon || coinsUsed > 0) && <s className="mr-2 text-sm font-medium text-white/40">{money(listPrice, currency)}</s>}
                            {price || coversAll ? money(price, currency) : "—"}
                        </p>
                        {/* The payment method decides the currency actually charged — say so when it differs from the display. */}
                        {price > 0 && payMode !== "credits" && (pay === "online_international" ? currency === "inr" : currency === "usd") && (
                            <p className="text-[11px] text-white/50 truncate">
                                {pay === "online_international" ? `Charged ${money(price, "usd")} via PayPal` : pay === "cod" ? `Pay ${inr(price)} at the ghat` : `Charged ${inr(price)} via Razorpay`}
                            </p>
                        )}
                    </div>
                    <button onClick={confirm} disabled={busy}
                        className={`${FIRE_BTN} h-12 px-6 sm:px-10`}>
                        {busy ? "Processing…" : payMode === "credits" ? "Book with coins" : pay === "cod" ? "Confirm booking" : pay === "online_international" ? "Pay with PayPal" : "Pay & book"}
                    </button>
                </div>
            </div>
        </div>
    );
}
