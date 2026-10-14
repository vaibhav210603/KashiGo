"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Check, Minus, Plus, Phone, Headphones, Wallet, Smartphone, Globe, Tag } from "lucide-react";
import { BOAT_PRICES_INR } from "@/lib/boatPrices";
import { RIDES_BY_POPULARITY, CUSTOM_RIDE, GHATS, BoatRideId, inr, istNow, addDaysIso, bookingTimeProblem, rideStartMinutes, BOOKING_WINDOW_DAYS } from "@/lib/boatRides";

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
        <section id={id} className="scroll-mt-24 rounded-3xl bg-white border border-slate-200/70 p-4 sm:p-6">
            <h2 className="flex items-center gap-3 font-heading font-semibold text-lg text-slate-900">
                <span className="w-7 h-7 shrink-0 rounded-full bg-orange-100 text-orange-600 text-sm font-bold inline-flex items-center justify-center">{n}</span>
                {title}
            </h2>
            <div className="mt-4">{children}</div>
            {error && <p className="mt-3 text-sm font-medium text-rose-600">{error}</p>}
        </section>
    );
}

const chip = (on: boolean) =>
    `shrink-0 min-h-11 px-4 rounded-full border text-sm font-semibold transition-colors ${on ? "bg-orange-500 border-orange-500 text-white" : "bg-white border-slate-200 text-slate-700 hover:border-orange-300"}`;

const input = "w-full h-12 rounded-2xl border border-slate-200 bg-white px-4 text-[16px] text-slate-900 placeholder:text-slate-400 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100";

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
    const [pay, setPay] = useState<PayMode>("online_international");
    const [busy, setBusy] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
    const [notice, setNotice] = useState("");
    const [code, setCode] = useState("");
    const [applied, setApplied] = useState<{ product: string; inr: number } | null>(null);
    const [codeMsg, setCodeMsg] = useState("");
    const [done, setDone] = useState<{ rideId: string; paid: boolean } | null>(null);
    const topRef = useRef<HTMLDivElement>(null);

    // Arrive with a ride already chosen from the homepage (/book?ride=p5); Indian visitors default to UPI.
    useEffect(() => {
        const q = new URLSearchParams(window.location.search).get("ride");
        if (q === "custom" || RIDES_BY_POPULARITY.some((r) => r.id === q)) setRide(q as RideChoice);
        try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (tz === "Asia/Calcutta" || tz === "Asia/Kolkata") setPay("online_domestic");
        } catch { }
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
    const price = coupon ? codePrice! : listPrice;
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
            const data = await fetch("/api/coupon", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product, code: c }) }).then((r) => r.json());
            if (data.valid && typeof data.inr === "number") { setApplied({ product, inr: data.inr }); setCodeMsg(`Code applied — you pay ${inr(data.inr)}`); return; }
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
        paymentMode: pay,
        passengerDetails: { name: name.trim(), phone: phone.trim(), email: email.trim(), passengersCount: guests },
        amount: price,
        coupon,
        razorpayPaymentId: paymentRef,
    });

    // Once a payment reference exists the customer has paid: always confirm — the server alerts the owner if anything needs follow-up.
    const submitBooking = async (paymentRef?: string) => {
        let rideId = "";
        try {
            const res = await fetch("/api/booking", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload(paymentRef)) });
            const data = await res.json();
            if (data.success) rideId = data.rideId;
        } catch { }
        if (!rideId && !paymentRef) {
            setNotice("We couldn't place your booking — please check your connection and try again, or call +91 81759 66910.");
            return;
        }
        setDone({ rideId: rideId || `KASHI-${String(paymentRef).slice(-6).toUpperCase()}`, paid: Boolean(paymentRef) });
        try { (window as any).gtag?.("event", "purchase", { currency: "INR", value: price, items: [{ item_id: product }] }); } catch { }
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // PayPal keeps the callbacks from when its button first rendered; route them through a ref
    // so a booking always uses what's on screen now, not what was there when the button appeared.
    const submitRef = useRef(submitBooking);
    useEffect(() => { submitRef.current = submitBooking; });

    const payRazorpay = async () => {
        const order = await fetch("/api/razorpay", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product, coupon }) })
            .then((r) => r.json()).catch(() => ({ success: false }));
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
        if (pay === "online_international") {
            document.getElementById("paypal")?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }
        setBusy(true);
        try {
            if (pay === "cod") await submitBooking();
            else await payRazorpay();
        } catch {
            setNotice("Couldn't open the payment window — check your connection or choose “Pay at the ghat”.");
        } finally {
            setBusy(false);
        }
    };

    if (done) {
        return (
            <div ref={topRef} className="rounded-3xl bg-white border border-slate-200/70 p-6 sm:p-10 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-teal-100 text-teal-600 flex items-center justify-center"><Check size={40} /></div>
                <h2 className="mt-5 font-heading font-bold text-3xl text-slate-900">You&apos;re booked!</h2>
                <p className="mt-2 text-slate-600">{email ? `Confirmation sent to ${email}.` : "Keep your ride number handy."}</p>
                <div className="mt-6 mx-auto max-w-sm rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50 p-5">
                    <p className="text-sm text-slate-500">Your ride number</p>
                    <p className="font-mono font-bold text-2xl text-orange-600">{done.rideId}</p>
                </div>
                <dl className="mt-6 mx-auto max-w-sm text-left text-[15px] divide-y divide-slate-100">
                    {[
                        ["Ride", rideLabel],
                        ["When", `${dateLabel?.top}, ${dateLabel?.bottom} · ${ride === "custom" ? customTime : selected?.time}`],
                        ["From", ghat],
                        ["Guests", String(guests)],
                        ["Total", `${inr(price)} · ${done.paid ? "paid" : "pay at the ghat"}`],
                    ].map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-4 py-2"><dt className="text-slate-500">{k}</dt><dd className="font-semibold text-slate-900 text-right">{v}</dd></div>
                    ))}
                </dl>
                <a href="tel:+918175966910" className="mt-6 inline-flex items-center gap-2 h-12 px-6 rounded-full border border-slate-200 font-semibold text-slate-800">
                    <Phone size={18} className="text-teal-600" /> Questions? +91 81759 66910
                </a>
                <Link href="/audiobooks#walk-the-ghats" className="mt-8 block rounded-2xl bg-gradient-to-r from-pink-50 to-amber-50 border border-pink-100 p-4 text-left">
                    <p className="flex items-center gap-2 font-semibold text-slate-900"><Headphones size={18} className="text-pink-500" /> Before or after your ride</p>
                    <p className="text-sm text-slate-600">Walk the Ghats — a local&apos;s 90-minute audio tour from Assi to Manikarnika. →</p>
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
                                className={`relative text-left rounded-2xl overflow-hidden border-2 transition-all ${on ? "border-orange-500 ring-4 ring-orange-100" : "border-transparent"}`}>
                                <div className="relative aspect-[4/3]">
                                    <Image src={r.image} alt="" fill className="object-cover" sizes="(max-width:640px) 45vw, 300px" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                                    {r.badge && <span className="absolute top-2 left-2 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-bold text-orange-600">{r.badge}</span>}
                                    {on && <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-orange-500 text-white inline-flex items-center justify-center"><Check size={16} /></span>}
                                    <div className="absolute bottom-0 inset-x-0 p-3 text-white">
                                        <p className="font-semibold leading-tight">{r.short}</p>
                                        <p className="text-xs text-white/85">{r.time} · <b>{inr(r.price)}</b></p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {ride === "custom" && (
                    <div className="mt-4 grid gap-3 rounded-2xl bg-amber-50 p-4">
                        <label className="text-sm font-semibold text-slate-700">Start time
                            <input type="time" value={customTime} onChange={(e) => { setCustomTime(e.target.value); setErrors((x) => ({ ...x, customTime: undefined })); }} className={`${input} mt-1`} />
                        </label>
                        <div className="flex gap-2">
                            <button type="button" className={chip(tripType === "round")} onClick={() => setTripType("round")}>Round trip</button>
                            <button type="button" className={chip(tripType === "single")} onClick={() => setTripType("single")}>One way</button>
                        </div>
                        {tripType === "single" && (
                            <label className="text-sm font-semibold text-slate-700">Drop me at
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
                            className={`w-[4.6rem] py-2.5 rounded-2xl border text-center transition-colors ${selectedDate === d.iso ? "bg-orange-500 border-orange-500 text-white" : "bg-white border-slate-200 text-slate-700"}`}>
                            <span className="block text-xs font-semibold">{d.top}</span>
                            <span className="block font-heading font-bold">{d.bottom}</span>
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
                <p className="mt-2 text-xs text-slate-500">Not sure? Dashashwamedh is closest to the evening Aarti.</p>
            </Section>

            <Section id="s-details" n={4} title="Your details" error={errors.name || errors.phone}>
                <div className="grid gap-3">
                    <input value={name} onChange={(e) => { setName(e.target.value); setErrors((x) => ({ ...x, name: undefined })); }} placeholder="Lead passenger name" autoComplete="name" className={input} />
                    <input value={phone} onChange={(e) => { setPhone(e.target.value); setErrors((x) => ({ ...x, phone: undefined })); }} placeholder="Phone number" type="tel" inputMode="tel" autoComplete="tel" className={input} />
                    <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (for your confirmation)" type="email" autoComplete="email" className={input} />
                    <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 h-14">
                        <span className="font-medium text-slate-700">Guests</span>
                        <div className="flex items-center gap-3">
                            <button type="button" aria-label="Fewer guests" onClick={() => setGuests((g) => Math.max(1, g - 1))} className="w-10 h-10 rounded-full bg-slate-100 inline-flex items-center justify-center"><Minus size={18} /></button>
                            <span className="w-6 text-center font-bold text-lg">{guests}</span>
                            <button type="button" aria-label="More guests" onClick={() => setGuests((g) => Math.min(20, g + 1))} className="w-10 h-10 rounded-full bg-slate-100 inline-flex items-center justify-center"><Plus size={18} /></button>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500">The price is for the whole private boat — not per person.</p>
                </div>
            </Section>

            <Section id="s-pay" n={5} title="How would you like to pay?">
                <div className="grid gap-2">
                    {([
                        ["online_domestic", Smartphone, "UPI / Indian card", "Pay now in ₹ · Razorpay"],
                        ["online_international", Globe, "International card / PayPal", "Pay now · secure PayPal checkout"],
                        ["cod", Wallet, "Pay at the ghat", "Cash or UPI to your boatman"],
                    ] as const).map(([mode, Icon, title, sub]) => (
                        <button key={mode} type="button" onClick={() => setPay(mode)} aria-pressed={pay === mode}
                            className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-colors ${pay === mode ? "border-orange-500 bg-orange-50" : "border-slate-200 bg-white"}`}>
                            <Icon size={22} className={pay === mode ? "text-orange-500" : "text-slate-400"} />
                            <span className="flex-1"><span className="block font-semibold text-slate-900">{title}</span><span className="block text-sm text-slate-500">{sub}</span></span>
                            <span className={`w-5 h-5 rounded-full border-2 ${pay === mode ? "border-orange-500 bg-orange-500 shadow-[inset_0_0_0_3px_white]" : "border-slate-300"}`} />
                        </button>
                    ))}
                </div>

                {pay !== "cod" && (
                    <div className="mt-4">
                        <label htmlFor="booking-code" className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Tag size={16} className="text-orange-500" /> Discount code</label>
                        <div className="mt-2 flex gap-2">
                            <input id="booking-code" value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setApplied(null); setCodeMsg(""); }}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyCode(); } }}
                                placeholder="Have a code?" autoComplete="off" className={`${input} uppercase`} />
                            <button type="button" onClick={applyCode} className="h-12 px-5 rounded-2xl border border-slate-300 bg-white font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap">Apply</button>
                        </div>
                        {codeMsg && (codePrice !== null || !applied) && <p className={`mt-2 text-sm font-medium ${codePrice !== null ? "text-teal-700" : "text-rose-600"}`}>{codeMsg}</p>}
                    </div>
                )}

                {pay === "online_international" && (
                    <div id="paypal" className="mt-4 scroll-mt-24">
                        {isValid ? (
                            <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "ATMGtSsoMxvX5hrhLzFYYuN1yNCAonxN-vV1xAtNKBRvL7cbgpMQ_EG1Nf7j-43XGcyyUlN6Eb4Our_0", currency: "USD" }}>
                                <PayPalButtons
                                    forceReRender={[product, coupon]}
                                    style={{ layout: "vertical", color: "gold", shape: "pill", label: "pay", height: 48 }}
                                    createOrder={async () => {
                                        const o = await fetch("/api/paypal/create-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product, coupon }) }).then((r) => r.json());
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
                            <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Fill in the steps above and the PayPal button appears here.</p>
                        )}
                    </div>
                )}
            </Section>

            {notice && <p role="alert" className="rounded-2xl bg-rose-50 border border-rose-100 p-4 text-sm font-medium text-rose-700">{notice}</p>}

            {/* Sticky summary + one action, always in thumb reach */}
            <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
                <div className="max-w-3xl mx-auto flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 truncate">{rideLabel ? `${rideLabel} · ${dateLabel?.top}` : "Choose a ride"}</p>
                        <p className="font-heading font-bold text-xl text-slate-900">
                            {coupon && <s className="mr-2 text-sm font-medium text-slate-400">{inr(listPrice)}</s>}
                            {price ? inr(price) : "—"}
                        </p>
                    </div>
                    <button onClick={confirm} disabled={busy}
                        className="h-12 px-6 sm:px-10 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-lg shadow-orange-500/30 disabled:opacity-60">
                        {busy ? "Processing…" : pay === "cod" ? "Confirm booking" : pay === "online_international" ? "Pay with PayPal" : "Pay & book"}
                    </button>
                </div>
            </div>
        </div>
    );
}
